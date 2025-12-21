# create_sample_data.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Create sample dataset for Bangladesh districts
districts = [
    "সিরাজগঞ্জ", "কুড়িগ্রাম", "গাইবান্ধা", "বগুড়া", "জামালপুর",
    "সুনামগঞ্জ", "সিলেট", "নেত্রকোণা", "কিশোরগঞ্জ", "রংপুর",
    "লালমনিরহাট", "নীলফামারী", "দিনাজপুর", "ঠাকুরগাঁও", "টাঙ্গাইল",
    "ময়মনসিংহ", "শেরপুর", "নরসিংদী", "নারায়ণগঞ্জ", "মুন্সীগঞ্জ"
]

data = []
start_date = datetime(2020, 1, 1)

for district in districts:
    # Base values for each district
    if district in ["সুনামগঞ্জ", "সিলেট", "কুড়িগ্রাম"]:
        # High flood risk areas
        base_rainfall = np.random.uniform(2500, 3500)
        base_river = np.random.uniform(15, 25)
    elif district in ["গাইবান্ধা", "জামালপুর", "ময়মনসিংহ"]:
        # Medium-high risk
        base_rainfall = np.random.uniform(2000, 2800)
        base_river = np.random.uniform(10, 18)
    else:
        # Lower risk
        base_rainfall = np.random.uniform(1500, 2200)
        base_river = np.random.uniform(5, 12)
    
    # Create monthly data for 3 years
    for month_offset in range(36):
        current_date = start_date + timedelta(days=30*month_offset)
        
        # Seasonal variation
        month = (current_date.month - 1) % 12 + 1
        
        if month in [6, 7, 8, 9]:  # Monsoon
            rainfall_multiplier = np.random.uniform(1.5, 2.5)
            river_multiplier = np.random.uniform(1.3, 2.0)
        elif month in [5, 10]:  # Pre/Post monsoon
            rainfall_multiplier = np.random.uniform(1.1, 1.4)
            river_multiplier = np.random.uniform(1.1, 1.3)
        else:
            rainfall_multiplier = np.random.uniform(0.3, 0.8)
            river_multiplier = np.random.uniform(0.5, 0.9)
        
        # Add yearly trend (increasing due to climate change)
        year_trend = 1 + (month_offset / 36) * 0.2  # 20% increase over 3 years
        
        data.append({
            'District': district,
            'Date': current_date.strftime('%Y-%m-%d'),
            'Year': current_date.year,
            'Month': month,
            'Annual_Rainfall_mm': base_rainfall * rainfall_multiplier * year_trend,
            'River_Water_Level_m': base_river * river_multiplier * year_trend,
            'Temperature_C': np.random.uniform(25, 35),
            'Humidity_Percent': np.random.uniform(65, 95),
            'Forest_Cover_Percent': np.random.uniform(10, 40),
            'Population_Density': np.random.uniform(800, 2500),
            'Agricultural_Land_Percent': np.random.uniform(50, 85),
            'Urbanization_Rate': np.random.uniform(15, 45)
        })

# Create DataFrame
df = pd.DataFrame(data)

# Save to CSV
df.to_csv('Bangladesh_Environmental_Climate_Change_Impact.csv', index=False)
print(f"✅ Sample dataset created with {len(df)} records")
print(f"📁 Saved to: Bangladesh_Environmental_Climate_Change_Impact.csv")