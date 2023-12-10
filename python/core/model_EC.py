import pandas as pd
import numpy as np

# read TSV file
df = pd.read_csv('protein.tsv', sep='\t', header=0) 

# print all columns
print(df.columns)

# transform Organism column from categorical to numerical
df['Organism'] = df['Organism'].astype('category')

not_null_ec = df[df['EC number'].isnull() == False]  

# we're going to preict EC number based on Sequence, then based on interPro and the n based on both
# we're going to test models based on the following features: Sequence, interPro, Sequence + interPro
# we're going to use the following models: Random Forest, SVM, Logistic Regression, Neural Network
# we're going to use the following metrics: accuracy, precision, recall, f1-score, confusion matrix

# split the data into train and test
from sklearn.model_selection import train_test_split
X = not_null_ec['Sequence']
y = not_null_ec['EC number']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Sequence is a string, we need to convert it to a numerical representation
# we're going to use the bag of words approach
from sklearn.feature_extraction.text import CountVectorizer
vectorizer = CountVectorizer()
vectorizer.fit(X_train)
X_train = vectorizer.transform(X_train)
X_test = vectorizer.transform(X_test)

# we're going to use the Random Forest model
from sklearn.ensemble import RandomForestClassifier
clf = RandomForestClassifier(random_state=42)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

# we're going to use the following metrics: accuracy, precision, recall, f1-score, confusion matrix
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
print('accuracy: ', accuracy_score(y_test, y_pred))
print('precision: ', precision_score(y_test, y_pred, average='weighted'))
print('recall: ', recall_score(y_test, y_pred, average='weighted'))
print('f1-score: ', f1_score(y_test, y_pred, average='weighted'))
print('confusion matrix: ', confusion_matrix(y_test, y_pred))


