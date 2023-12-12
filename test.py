import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import norm, expon, gamma, lognorm, weibull_min
from scipy.optimize import curve_fit


value = [0,0,5452, 7544, 9770, 8535, 6662, 4658, 2864, 2289, 1200, 792, 557, 429, 372, 117, 46, 85, 18, 16, 21, 22, 9, 6, 3, 6, 1, 4, 13, 2, 0, 0, 0, 0, 0, 0, 5, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1]
data = [i for i in range(len(value)) for j in range(value[i])]

plt.hist(data, bins=80, density=True, label='Data')

# Step 3: Fit various distributions and calculate AIC
distributions = [norm]
best_fit = None
best_params = None
best_aic = np.inf  # Start with a high AIC value

for distribution in distributions:
    # Fit the distribution to the data
    if distribution.name == 'norm':
        params, _ = curve_fit(distribution.pdf, np.arange(len(data)), data, p0=[0, 1])
        offset = params[0]
        scale = params[1]
        params, _ = curve_fit(lambda x, offset, scale: distribution.pdf(x, loc=offset, scale=scale), np.arange(len(data)), data, p0=[offset, scale])
    elif distribution.name == 'expon':
        params, _ = curve_fit(distribution.pdf, np.arange(len(data)), data, p0=[1])
    elif distribution.name == 'gamma':
        params, _ = curve_fit(distribution.pdf, np.arange(len(data)), data, p0=[1, 0, 1])
    elif distribution.name == 'lognorm':
        params, _ = curve_fit(distribution.pdf, np.arange(len(data)), data, p0=[0, 1])
    elif distribution.name == 'weibull_min':
        params, _ = curve_fit(distribution.pdf, np.arange(len(data)), data, p0=[1, 0])

    
    # Calculate the PDF values for the fitted distribution
    pdf_values = distribution.pdf(np.arange(len(data)), *params)
    
    # Calculate the AIC
    aic = len(data) * np.log(np.sum((pdf_values - data)**2))
    
    # Compare AIC values
    if aic < best_aic:
        best_fit = distribution
        best_params = params
        best_aic = aic

# Step 4: Plot the best fit
x = np.linspace(min(data), max(data), 100)
plt.plot(x, best_fit.pdf(x, *best_params), 'r-', label=f'Best Fit ({best_fit.name})')

# Add labels and legend
plt.xlabel('Value')
plt.ylabel('Probability Density')
plt.legend()

# Show the plot
plt.show()

# Print the best fit and its parameters
print(f'Best fit: {best_fit.name}')
print(f'Best fit parameters: {best_params}')