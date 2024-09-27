import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Form, FormSchema } from '../types';

export const useFormConcepts = (form?: Form) => {
  const valueReferenceUuid = form?.resources?.find(({ name }) => name === 'JSON schema')?.valueReference;
  const formHasResources = form && form?.resources?.length > 0 && valueReferenceUuid;
  const url = `${restBaseUrl}/clobdata/${valueReferenceUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<{ data: { results: FormSchema } }, Error>(
    formHasResources ? url : null,
    openmrsFetch,
  );

  const flattenFormQuestions = (data: any) => {
    if (!data?.pages) {
      console.error('Expected data structure not found. Current structure:', data);
      return [];
    }
    let totalQuestions = 0;
    let questionsWithConcept = 0;

    const flattenedQuestions = data?.pages.flatMap((page: any, pageIndex: number) => {
      return (page.sections || []).flatMap((section: any, sectionIndex: number) => {
        return (section.questions || [])
          .map((question: any, questionIndex: number) => {
            totalQuestions++;
            if (question.questionOptions?.concept) {
              questionsWithConcept++;
              return {
                concept: question.questionOptions.concept,
                label: question.label || `Question ${questionIndex + 1}`, // Add fallback label
              };
            } else {
              return null;
            }
          })
          .filter((q: any) => q !== null); // Filter out nulls
      });
    });
    return flattenedQuestions;
  };
  const flattenedConcepts = flattenFormQuestions(data?.data);

  return {
    formConcepts: flattenedConcepts ?? [],
    formConceptsError: error,
    isLoadingFormConcepts: isLoading,
    isValidatingClobdata: isValidating,
    mutate: mutate,
  };
};
