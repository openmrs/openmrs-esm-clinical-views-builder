export const dummySchema = {
  $schema: './standard-schema.json',
  '@openmrs/esm-patient-chart-app': {
    extensionSlots: {
      'patient-chart-dashboard-slot': {
        add: ['nav-group#hivCareTreatment'],
        configure: {
          'nav-group#hivCareTreatment': {
            title: 'HIV Care Treatment',
            slotName: 'hiv-care-treatment-slot',
            isExpanded: true,
          },
        },
      },
    },
  },
};
