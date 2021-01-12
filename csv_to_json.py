import os
import pandas as pd

dir = r""+os.getcwd()+"/Datasets/csv"

for subdir, dirs, files in os.walk(dir):
    for filename in files:
        filepath_in = subdir + os.sep + filename
        filepath_out = subdir.replace('csv', 'json') + os.sep + filename.replace('CSV', 'json')
        df = pd.read_csv (filepath_in)
        df.to_json (filepath_out, orient='records')
        print('Finished '+filename)