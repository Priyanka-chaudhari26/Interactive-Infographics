import pandas as pd

# Load dataset
df = pd.read_csv("smmh.csv")

# Drop Timestamp
df = df.drop(columns=["Timestamp"])

# Map screen time ranges to numbers
screen_time_map = {
    "Less than an Hour": 0.5,
    "Between 1 and 2 hours": 1.5,
    "Between 2 and 3 hours": 2.5,
    "Between 3 and 4 hours": 3.5,
    "Between 4 and 5 hours": 4.5,
    "More than 5 hours": 6
}
df["ScreenTimeHours"] = df["8. What is the average time you spend on social media every day?"].map(screen_time_map)

# Create age buckets
bins = [10, 19, 29, 39, 49, 59, 69]
labels = ["10–19", "20–29", "30–39", "40–49", "50–59", "60–69"]
df["AgeGroup"] = pd.cut(df["1. What is your age?"], bins=bins, labels=labels)

# Encode Gender
df["Gender"] = df["2. Gender"].replace({
    "Male": 0, "Female": 1, "Nonbinary": 2, "NB": 2, "unsure": 3
})

# Encode Relationship Status
df["Relationship Status"] = df["3. Relationship Status"].replace({
    "Single": 0, "In a relationship": 1, "Married": 2, "Divorced": 3
})

# Fill missing values with median for numeric, mode for categorical
df.fillna({
    "ScreenTimeHours": df["ScreenTimeHours"].median(),
    "Gender": df["Gender"].mode()[0],
    "Relationship Status": df["Relationship Status"].mode()[0]
}, inplace=True)

# Save preprocessed dataset
df.to_csv("preprocessed_social_media_mental_health.csv", index=False)

# Show summary
print(df.head())
