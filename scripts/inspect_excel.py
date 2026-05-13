import pandas as pd
from pathlib import Path
path = Path(r"d:\Naufal's Project\UMMCEvaluation\3.Borang Penilaian Klinikal Latest.xls")
print('FILE:', path)
xl = pd.ExcelFile(path)
print('SHEETS:', xl.sheet_names)
for sheet in xl.sheet_names:
    df = xl.parse(sheet, nrows=50)
    print('\n--- Sheet:', sheet, '---')
    with pd.option_context('display.max_rows', 20, 'display.max_columns', 50):
        print(df.head(20).to_string(index=False))
