export const savePackageToLocalStorage = (packageName: string, packageData: any) => {
  localStorage.setItem(packageName, JSON.stringify(packageData));
};

export const getPackageFromLocalStorage = (packageName: string) => {
  const packageData = localStorage.getItem(packageName);
  return packageData ? JSON.parse(packageData) : null;
};

export const getAllPackagesFromLocalStorage = () => {
  const packages: any = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('@openmrs/esm-patient-chart-app')) {
      // Ensure to only get relevant packages
      packages[key] = JSON.parse(localStorage.getItem(key)!);
    }
  }
  return packages;
};

export const deletePackageFromLocalStorage = (packageName: string) => {
  localStorage.removeItem(packageName);
};
