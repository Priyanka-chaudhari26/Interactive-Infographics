import pandas as pd

df = pd.read_csv("p2_social_media_mental_health.csv")
df["AgeGroup"] = df["AgeGroup"].replace({
    "Oct-19": "10_19",  
    "Oct/19": "10_19",   
    "01-10-2019": "10_19"
})
df["AgeGroup"] = df["AgeGroup"].str.replace("-", "_", regex=False)
df["AgeGroup"] = df["AgeGroup"].astype(str)
df.to_csv("p3_social_media_mental_health.csv", index=False, quoting=1)
print(df.head())