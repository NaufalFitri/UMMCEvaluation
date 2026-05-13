import pandas as pd
from pathlib import Path
path = Path(r"d:\Naufal's Project\UMMCEvaluation\3.Borang Penilaian Klinikal Latest.xls")
print('FILE:', path)
xl = pd.ExcelFile(path)
print('SHEETS:', xl.sheet_names)
for sheet in xl.sheet_names:
    df = xl.parse(sheet, header=None)
    print('\n--- Sheet:', sheet, '---')
    print('SHAPE:', df.shape)
    for idx, row in df.iterrows():
        values = [str(v).strip() for v in row.tolist() if pd.notna(v) and str(v).strip() != '']
        if values:
            print(f'ROW {idx + 1}:', ' | '.join(values[:12]))
