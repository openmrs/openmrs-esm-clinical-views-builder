import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useEncounterTypes = () => {
  const customRepresentation = 'custom:(uuid,name,display)';
  const url = `${restBaseUrl}/encountertype?v=${customRepresentation}`;

  const { data, error } = useSWR<any, Error>(url, openmrsFetch);

  return {
    isLoading: !data && !error,
    encounterTypes: data?.data?.results ?? [],
    encounterTypesError: error,
  };
};
