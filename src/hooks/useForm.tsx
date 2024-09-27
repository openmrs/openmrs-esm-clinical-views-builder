import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Form } from '../types';

export const useForms = () => {
  const customFormRepresentation =
    '(uuid,name,display,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))';

  const url = `${restBaseUrl}/form?v=custom:${customFormRepresentation}`;

  const { data, error } = useSWR<{ data: { results: Array<Form> } }, Error>(url, openmrsFetch);

  const mappedForms = data?.data?.results.filter((form) => form.published === true && form.retired === false) ?? [];
  return {
    isLoadingForm: !data && !error,
    forms: mappedForms,
    formsError: error,
  };
};
