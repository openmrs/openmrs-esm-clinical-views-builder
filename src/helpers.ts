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
