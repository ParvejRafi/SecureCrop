# Dataset Directory

## Upload Your Datasets Here

Place your real crop recommendation datasets in this directory.

### Supported Files
- `gathered_data.csv` - Your gathered crop data
- `crop_recommendation.csv` - Your crop recommendation data

You can upload one or both files. The training script will automatically combine them if both are present.

### Required Columns

Your CSV file(s) must contain these columns:

| Column Name | Alternative Names | Description |
|-------------|------------------|-------------|
| `N` | - | Nitrogen content |
| `P` | - | Phosphorus content |
| `K` | - | Potassium content |
| `ph` | `pH` | pH level |
| `moisture` | - | Moisture level |
| `temperature` | `temp` | Temperature |
| `crop` | `label` | Crop name (target variable) |

### Example Format

```csv
N,P,K,ph,moisture,temperature,crop
90,42,43,6.5,80,20,Rice
85,58,41,7.0,70,25,Wheat
40,40,40,6.0,60,30,Cotton
```

### Training the Model

After uploading your datasets, run:

```bash
python ml_engine/train_model.py
```

The script will:
1. Load your real datasets
2. Validate the data
3. Train multiple models (RandomForest, SVC, KNN, GaussianNB)
4. Select and save the best performing model
5. Register the model in the database
