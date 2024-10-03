export const generateNodeId = (string) =>
  string
    ?.toLowerCase()
    ?.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');

export const getSubMenuSlotDetails = (schema, subMenuSlot) => {
  const patientChartApp = schema['@openmrs/esm-patient-chart-app'];
  if (patientChartApp && patientChartApp.extensionSlots) {
    return patientChartApp.extensionSlots[subMenuSlot];
  }
  return null;
};

export const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toLowerCase() : match.toUpperCase()))
    .replace(/\s+/g, '');
};

export const isValidSlotName = (slotName: string) => {
  return /^[a-zA-Z0-9-]+$/.test(slotName);
};
