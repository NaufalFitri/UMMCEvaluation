import numpy as np
import matplotlib.pyplot as plt

# Define x range for diff_var normalized [-1,1]
x = np.linspace(-1.0, 1.0, 1000)

# Membership functions for diff_var

def trapezoid(x, a, b, c, d):
    return np.maximum(0, np.minimum(np.minimum((x-a)/(b-a+1e-9), 1), np.minimum((d-x)/(d-c+1e-9), 1)))

def triangle(x, a, b, c):
    return np.maximum(0, np.minimum((x-a)/(b-a+1e-9), (c-x)/(c-b+1e-9)))

underrate = trapezoid(x, -1.0, -1.0, -0.6, -0.2)
slightly_underrate = triangle(x, -0.4, -0.2, 0.0)
accurate = triangle(x, -0.1, 0.0, 0.1)
slightly_overrate = triangle(x, 0.0, 0.2, 0.4)
overrate = trapezoid(x, 0.2, 0.6, 1.0, 1.0)

# Output MF on 0..100

y = np.linspace(0, 100, 1000)
poor = triangle(y, 0, 10, 35)
fair = triangle(y, 25, 45, 60)
good = triangle(y, 50, 70, 85)
excellent = triangle(y, 75, 90, 100)

# Plot
plt.figure(figsize=(12,6))

plt.subplot(1,2,1)
plt.plot(x, underrate, label='Underrate')
plt.plot(x, slightly_underrate, label='SlightlyUnderrate')
plt.plot(x, accurate, label='Accurate')
plt.plot(x, slightly_overrate, label='SlightlyOverrate')
plt.plot(x, overrate, label='Overrate')
plt.title('Input Membership Functions (diff_var)')
plt.xlabel('diff (assessor - student) normalized')
plt.ylabel('Membership')
plt.legend()
plt.grid(True)

plt.subplot(1,2,2)
plt.plot(y, poor, label='Poor')
plt.plot(y, fair, label='Fair')
plt.plot(y, good, label='Good')
plt.plot(y, excellent, label='Excellent')
plt.title('Output Membership Functions (critiqueScore)')
plt.xlabel('critiqueScore (0..100)')
plt.ylabel('Membership')
plt.legend()
plt.grid(True)

plt.tight_layout()
import os

out_dir = os.path.join(os.getcwd(), 'docs', 'images')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'membership_functions.png')
plt.savefig(out_path, dpi=150)
print(f'Saved {out_path}')
