export const mockContentPackages = [
  {
    '@openmrs/esm-patient-chart-app': {
      extensionSlots: {
        'patient-chart-dashboard-slot': {
          add: ['nav-group#HIVCareTreatment'],
          configure: {
            'nav-group#HIVCareTreatment': {
              title: 'hIVCareAndTreatment',
              slotName: 'hiv-care-and-treatment-group-slot',
              isExpanded: true,
            },
            'Translation overrides': {
              en: {
                hIVCareAndTreatment: 'HIV Care And Treatment',
              },
              fr: {
                hIVCareAndTreatment: 'Soins et traitement du VIH',
              },
            },
          },
        },
        'hiv-care-and-treatment-group-slot': {
          add: [
            'dashboard#hct-patient-summary',
            'dashboard#hct-program-management',
            'dashboard#hct-clinical-visits',
            'dashboard#hct-general-counselling',
            'dashboard#hct-partner-notification',
          ],
          configure: {
            'dashboard#hct-patient-summary': {
              title: 'patientSummary',
              path: 'hct-patient-summary',
              slot: 'hct-patient-summary-dashboard-slot',
            },
            'dashboard#hct-program-management': {
              title: 'programManagement',
              path: 'hct-program-management',
              slot: 'hct-program-management-dashboard-slot',
            },
            'dashboard#hct-clinical-visits': {
              title: 'clinicalVisits',
              path: 'hct-clinical-visits',
              slot: 'hct-clinical-visits-dashboard-slot',
            },
            'dashboard#hct-general-counselling': {
              title: 'generalCounselling',
              path: 'hct-general-counselling',
              slot: 'hct-general-counselling-dashboard-slot',
            },
            'dashboard#hct-partner-notification': {
              title: 'partnerNotification',
              path: 'hct-partner-notification',
              slot: 'hct-partner-notification-dashboard-slot',
            },
          },
          'Translation overrides': {
            en: {
              patientSummary: 'Patient Summary',
              programManagement: 'Program Management',
              clinicalVisits: 'Clinical Visists',
              partnerNotification: 'Partner Notification',
              generalCounselling: 'General Counselling',
            },
            fr: {
              patientSummary: 'Résumé du patient',
              programManagement: 'Gestion du programme',
              clinicalVisits: 'Visites cliniques',
              partnerNotification: 'Notification des partenaires',
              generalCounselling: 'Conseil général',
            },
          },
        },
        'hct-clinical-visits-dashboard-slot': {
          add: ['encounter-list-table-tabs'],
          configure: {
            'encounter-list-table-tabs': {
              tabDefinitions: [
                {
                  tabName: 'clinicalVisit',
                  headerTitle: 'clinicalVisit',
                  displayText: 'clinicalVisitEncounters',
                  encounterType: 'cb0a65a7-0587-477e-89b9-cf2fd144f1d4',
                  columns: [
                    {
                      id: 'clinicalVisitDate',
                      isDate: true,
                      title: 'visitDate',
                      concept: '163137AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      isLink: true,
                    },
                    {
                      id: 'clinicalVisitType',
                      title: 'visitType',
                      concept: '8a9809e9-8a0b-4e0e-b1f6-80b0cbbe361b',
                    },
                    {
                      id: 'clinicalScreeningOutcome',
                      title: 'tBScreeningOutcome',
                      concept: '160108AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                    {
                      id: 'clinicalNextAppointmentDate',
                      title: 'nextAppointmentDate',
                      isDate: true,
                      concept: '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                    {
                      id: 'actions',
                      title: 'actionsTitle',
                      actionOptions: [
                        {
                          formName: 'POC Clinical Visit Form v2',
                          label: 'viewDetails',
                          mode: 'view',
                        },
                        {
                          formName: 'POC Clinical Visit Form v2',
                          label: 'editForm',
                          mode: 'edit',
                        },
                      ],
                    },
                  ],
                  launchOptions: {
                    displayText: 'add',
                  },
                  formList: [
                    {
                      uuid: 'b3abc4ce-c5ac-3c40-b8e7-442b163670f1',
                    },
                  ],
                },
              ],
            },
            'Translation overrides': {
              en: {
                clinicalVisit: 'Clinical Visit',
                clinicalVisitEncounters: 'clinical visit encounters',
                visitDate: 'Visit Date',
                visitType: 'Visit Type',
                tbScreeningOutcome: 'TB Screening Outcome',
                nextAppointmentDate: 'Next Appointment Date',
                actionsTitle: 'Actions',
                viewDetails: 'View Details',
                editForm: 'Edit Form',
                add: 'Add',
              },
              fr: {
                clinicalVisit: 'Visite clinique',
                clinicalVisitEncounters: 'Rencontres de visite clinique',
                visitDate: 'Date de visite',
                visitType: 'Type de visite',
                tbScreeningOutcome: 'Résultat du dépistage de la tuberculose',
                nextAppointmentDate: 'Date du prochain rendez-vous',
                actionsTitle: 'Actions',
                viewDetails: 'Voir les détails',
                editForm: 'Modifier le formulaire',
                add: 'Ajouter',
              },
            },
          },
        },
        'hct-partner-notification-dashboard-slot': {
          add: ['encounter-list-table-tabs'],
          configure: {
            'encounter-list-table-tabs': {
              tabDefinitions: [
                {
                  tabName: 'partnerNotification',
                  hasFilter: true,
                  headerTitle: 'partnerNotification',
                  displayText: 'partnerNotification',
                  encounterType: '4dd0ee63-805f-43e9-833c-6386ba97fdc1',
                  columns: [
                    {
                      id: 'contactDate',
                      isDate: true,
                      title: 'contactDateTitle',
                      concept: '160753AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                    {
                      id: 'name',
                      title: 'NameTitle',
                      concept: '166102AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                    {
                      id: 'relationship',
                      title: 'relationshipTitle',
                      concept: '85d3b4fe-c1a9-4e27-a86b-dcc1e30c8a93',
                    },
                    {
                      id: 'hivStatus',
                      title: 'status',
                      concept: '1436AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      type: 'hivStatus',
                      statusColorMappings: {
                        '703AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'red',
                        '664AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'gray',
                        '1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 'purple',
                      },
                    },
                    {
                      id: 'actions',
                      title: 'actionsTitle',
                      actionOptions: [
                        {
                          formName: 'Partner Notification Form',
                          package: 'hiv-care-treatment',
                          label: 'viewDetails',
                          mode: 'view',
                        },
                        {
                          formName: 'Partner Notification Form',
                          package: 'hiv-care-treatment',
                          label: 'editForm',
                          mode: 'edit',
                        },
                      ],
                    },
                  ],
                  launchOptions: {
                    displayText: 'add',
                  },
                  formList: [
                    {
                      uuid: '8c48efc5-dd85-3795-9f58-8eb436a4edcc',
                    },
                  ],
                },
                {
                  tabName: 'contactTracing',
                  hasFilter: false,
                  headerTitle: 'contactTracing',
                  displayText: 'contactTracing',
                  encounterType: '570e9e42-4306-41dc-9bf8-634bbc70a524',
                  columns: [
                    {
                      id: 'contactDate',
                      isDate: true,
                      title: 'contactDateTitle',
                      concept: '160753AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                    },
                    {
                      id: 'contactMethod',
                      title: 'contactMethodTitle',
                      concept: '59c023dd-eed2-4b11-8c34-b88e9439db3c',
                    },
                    {
                      id: 'contactOutcome',
                      title: 'contactOutcomeTitle',
                      concept: '36a3e671-9d60-4109-b41f-046f44f4b389',
                    },
                    {
                      id: 'actions',
                      title: 'actionsTitle',
                      actionOptions: [
                        {
                          formName: 'Contact Tracing Form',
                          package: 'hiv-care-treatment',
                          label: 'viewDetails',
                          mode: 'view',
                        },
                        {
                          formName: 'Contact Tracing Form',
                          package: 'hiv-care-treatment',
                          label: 'editForm',
                          mode: 'edit',
                        },
                      ],
                    },
                  ],
                  launchOptions: {
                    displayText: 'add',
                  },
                  formList: [
                    {
                      uuid: '94a911a8-8da1-3c12-b696-2f3e78c2e87c',
                    },
                  ],
                },
              ],
            },
            'Translation overrides': {
              en: {
                partnerNotification: 'Partner Notification',
                contactTracing: 'Contact Tracing',
                contactDateTitle: 'Contact Date',
                nameTitle: 'Name',
                relationshipTitle: 'Relationship',
                status: 'Status',
                contactMethodTitle: 'Contact Method',
                contactOutcomeTitle: 'Contact Outcome',
                actionsTitle: 'Actions',
                viewDetails: 'View Details',
                editForm: 'Edit Form',
                add: 'Add',
              },
              fr: {
                partnerNotification: 'Notification des partenaires',
                contactTracing: 'Recherche des contacts',
                contactDateTitle: 'Date de contact',
                nameTitle: 'Nom',
                relationshipTitle: 'Relation',
                status: 'Statut',
                contactMethodTitle: 'Méthode de contact',
                contactOutcomeTitle: 'Résultat du contact',
                actionsTitle: 'Actions',
                viewDetails: 'Voir les détails',
                editForm: 'Modifier le formulaire',
                add: 'Ajouter',
              },
            },
          },
        },
      },
    },
  },
];
