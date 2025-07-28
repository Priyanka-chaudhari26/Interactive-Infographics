fetch('final_dataset.json')
    .then(response => response.json())
    .then(data => {
        console.log('Loaded Data:', data); 

        // Render all charts
        renderScreenTimeChart(data);
        renderDepressionChart(data);
        renderGenderSplitChart(data);
        renderCorrelationChart(data);
        renderPlatformChart(data);
    })
    .catch(error => console.error('Error loading JSON:', error));

function renderScreenTimeChart(data) {
    const ageGroups = {};

    data.forEach(entry => {
        const age = entry.AgeGroup;
        const time = parseFloat(entry.ScreenTimeHours);

        // Skip invalid rows
        if (!age || isNaN(time)) return;

        if (!ageGroups[age]) {
            ageGroups[age] = { totalTime: 0, count: 0 };
        }
        ageGroups[age].totalTime += time;
        ageGroups[age].count += 1;
    });

    // Convert object to array and sort by age range
    const sortedAgeGroups = Object.keys(ageGroups)
        .sort((a, b) => {
            const numA = parseInt(a.split("_")[0]);
            const numB = parseInt(b.split("_")[0]);
            return numA - numB;
        });

    const labels = sortedAgeGroups.map(group => group.replace("_", "-"));
    const avgTimes = sortedAgeGroups.map(group => (ageGroups[group].totalTime / ageGroups[group].count).toFixed(2));
    
    // Create chart
    new Chart(document.getElementById('chart-screen-time'), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Avg Screen Time (hrs)',
            data: avgTimes,
            borderColor: '#4CAF50',
            backgroundColor: '#A5D6A7',
            tension: 0.3, // smooth curve
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: '#2E7D32'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Hours'
                }
            }
        }
    }
    });

}

function renderDepressionChart(data) {
    const ageGroups = {};

    data.forEach(entry => {
        const age = entry.AgeGroup?.trim();
        const q18 = parseInt(entry["Depressed or down"]); 
        const q11 = parseInt(entry["Restlessness"]);
        console.log("AgeGroup:", age, "Depressed:", q18, "Restless:", q11);

        // Skip if AgeGroup is missing
        if (!age) return;

        if (!ageGroups[age]) {
            ageGroups[age] = { total: 0, depressedCount: 0, restlessCount: 0 };
        }

        // Only count rows where at least one score is valid
        if (!isNaN(q18) || !isNaN(q11)) {
            ageGroups[age].total += 1;

            if (!isNaN(q18) && q18 >= 4) ageGroups[age].depressedCount += 1;
            if (!isNaN(q11) && q11 >= 4) ageGroups[age].restlessCount += 1;
        }
    });

    // Sort AgeGroups
    const sortedAgeGroups = Object.keys(ageGroups)
        .sort((a, b) => parseInt(a.split("_")[0]) - parseInt(b.split("_")[0]));

    const labels = sortedAgeGroups.map(group => group.replace("_", "-"));
    const depressedPercent = sortedAgeGroups.map(group =>
        ageGroups[group].total > 0
            ? ((ageGroups[group].depressedCount / ageGroups[group].total) * 100).toFixed(1)
            : 0
    );
    const restlessPercent = sortedAgeGroups.map(group =>
        ageGroups[group].total > 0
            ? ((ageGroups[group].restlessCount / ageGroups[group].total) * 100).toFixed(1)
            : 0
    );

    new Chart(document.getElementById('chart-depression'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '% Feeling Depressed',
                    data: depressedPercent,
                    // backgroundColor: '#FF6B6B'
                    backgroundColor: '#F06292'
                },
                {
                    label: '% Feeling Restless',
                    data: restlessPercent,
                    backgroundColor: '#4D96FF'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function renderGenderSplitChart(data) {
    const genderCounts = { Male: 0, Female: 0, total: 0 };

    data.forEach(entry => {
        const gender = entry.Gender;
        const q17 = parseInt(entry["Seek Social Validations"]); // Q17
        if (!gender || isNaN(q17)) return;

        if (q17 >= 4) {
            genderCounts[gender] += 1;
        }
        genderCounts.total += 1;
    });

    const labels = ['Male', 'Female'];
    const percentages = labels.map(gender =>
        ((genderCounts[gender] / genderCounts.total) * 100).toFixed(1)
    );

    new Chart(document.getElementById('chart-gender-split'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: '% Validation Seeking',
                data: percentages,
                backgroundColor: ['#a550a5ff', '#a464e4c3'], 
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            cutout: '60%', // thinner donut ring
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed}%`
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#444',
                        font: {
                            size: 13
                        }
                    }
                }
            },
            layout: {
                padding: {
                    // top: 100,
                    bottom: 150,
                    left: 100,
                    right: 100
                }
            }
        }
    });
}

function renderCorrelationChart(data) {
    const screenTimeBuckets = {};
    
    data.forEach(entry => {
        const screenTime = Math.round(parseFloat(entry.ScreenTimeHours)); // Round screen time
        const depression = parseInt(entry["Depressed or down"]);

        if (!isNaN(screenTime) && !isNaN(depression)) {
            const key = `${screenTime}_${depression}`;
            if (!screenTimeBuckets[key]) {
                screenTimeBuckets[key] = 0;
            }
            screenTimeBuckets[key] += 1;
        }
    });

    const heatmapData = Object.keys(screenTimeBuckets).map(key => {
        const [x, y] = key.split("_").map(Number);
        return { x, y, count: screenTimeBuckets[key] };
    });

    const ctx = document.getElementById('chart-correlation').getContext('2d');
    new Chart(ctx, {
        type: 'bubble', // using bubble as heatmap workaround
        data: {
            datasets: [{
                label: 'Screen Time vs Depression Heatmap',
                data: heatmapData.map(point => ({
                    x: point.x,
                    y: point.y,
                    r: Math.sqrt(point.count) * 4 // bubble size scales with count
                })),
                backgroundColor: heatmapData.map(point => 
                    `rgba(${255 - point.count * 20}, ${100 + point.count * 10}, ${150}, 0.7)`
                )
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => {
                            const { x, y, r } = context.raw;
                            return `Screen Time: ${x} hrs\nDepression: ${y}\nCount: ${Math.round(r * r / 16)}`;
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Screen Time (hours)' },
                    min: 0,
                    max: 7,
                    ticks: { stepSize: 1 }
                },
                y: {
                    title: { display: true, text: 'Depression Score' },
                    min: 0,
                    max: 6,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderPlatformChart(data) {
    const platformCounts = {};

    // Loop through all entries
    data.forEach(entry => {
        const platforms = entry["Social media platforms"];
        if (platforms) {
            platforms.split(",").forEach(platform => {
                const trimmedPlatform = platform.trim();
                if (trimmedPlatform) {
                    platformCounts[trimmedPlatform] = (platformCounts[trimmedPlatform] || 0) + 1;
                }
            });
        }
    });

    // Convert to array & sort descending
    const sortedPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);

    const labels = sortedPlatforms.map(item => item[0]);
    const counts = sortedPlatforms.map(item => item[1]);

    new Chart(document.getElementById('chart-platforms'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'No. of Users',
                data: counts,
                backgroundColor: [
                    '#526ca3ff', // Facebook
                    '#e86893ff', // Instagram
                    '#6abff3ff', // Twitter
                    '#ee5e5eff', // YouTube
                    '#6ad290ff', // WhatsApp
                    '#98a8e0ff', // Discord
                    '#5795b6ff', // LinkedIn
                    '#fa7f53ff', // Reddit
                    '#69C9D0', // TikTok
                    '#F56040', // Snapchat
                    '#A8A8A8'  // Others
                ],
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw} users`
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Users'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Social Media Platforms'
                    }
                }
            }
        }
    });
}
