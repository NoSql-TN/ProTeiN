tsv_path = 'uniprotkb_AND_reviewed_true_2023_12_05.tsv'

# needed imports
import os
from neo4j import GraphDatabase
import pandas as pd
import numpy as np
import time
import sys
import tqdm

# function to load the data from the tsv files
def delete_data(tsv_path):
    # load the data
    data = pd.read_csv(tsv_path, sep='\t')
    # iterate over the rows and keep only one row every 10
    new_data = pd.DataFrame(columns=data.columns)
    for index, row in tqdm.tqdm(data.iterrows(), total=data.shape[0]):
        if index % 10 == 0:
            new_data = new_data._append(row)
    # save the data in a csv file
    new_data.to_csv('protein.csv', index=False)
            

    

if __name__ == "__main__":
    # start the timer
    start = time.time()
    # load the data
    delete_data(tsv_path)
    # stop the timer
    end = time.time()
    # print the time
    print(f"Time to load the data: {end - start} seconds")
