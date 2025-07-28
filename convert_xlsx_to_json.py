import pandas as pd

# Load the Excel file
input_file = "final_social_media_mental_health.xlsx"  # Change this to your file name
output_file = "final_dataset.json" # Output file name

# Read Excel file into DataFrame
df = pd.read_excel(input_file)

# Convert DataFrame to JSON
df.to_json(output_file, orient="records", indent=4)

print(f" Conversion complete! JSON saved as {output_file}")
