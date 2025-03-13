import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ProgressData {
  filled: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class FormProgressService {
  // Emits the overall progress percentage (0-100)
  private readonly progressSubject = new BehaviorSubject<number>(0);
  progress$ = this.progressSubject.asObservable();

  // Store progress details for each component
  private componentProgress: { [componentName: string]: ProgressData } = {};

  /**
   * Call this from each component whenever its form value changes.
   * @param componentName A unique identifier for the component (e.g. 'registrationForm')
   * @param formData The current value of the component's form
   * @param requiredMapping An object that maps required field keys.
   */
  updateComponentProgress(
    componentName: string,
    formData: any,
    requiredMapping: { [key: string]: any }
  ): void {
    const { filled, total } = this.calculateProgress(formData, requiredMapping);
    this.componentProgress[componentName] = { filled, total };
    this.updateOverallProgress();
  }

  /**
   * Calculate progress for a given form using its required mapping.
   */
  private calculateProgress(
    formData: any,
    requiredMapping: { [key: string]: any }
  ): { filled: number; total: number } {
    let filled = 0;
    let total = 0;

    Object.keys(requiredMapping).forEach((field) => {
      const mapping = requiredMapping[field];

      // Case 1: Mapping is an array.
      if (Array.isArray(mapping)) {
        // Top-level field if mapping === ['']
        if (mapping.length === 1 && mapping[0] === '') {
          total++;
          if (this.isFilled(formData[field])) {
            filled++;
          }
        } else {
          // Nested fields in an array
          mapping.forEach((subField: string) => {
            total++;
            if (formData[field] && this.isFilled(formData[field][subField])) {
              filled++;
            }
          });
        }
      }
      // Case 2: Mapping is an object with fields and a possible conditional rule.
      else if (mapping && typeof mapping === 'object') {
        if (mapping.fields && Array.isArray(mapping.fields)) {
          mapping.fields.forEach((subField: string) => {
            total++;
            if (formData[field] && this.isFilled(formData[field][subField])) {
              filled++;
            }
          });
          // Process conditional rule if defined.
          if (
            mapping.conditional &&
            typeof mapping.conditional === 'object' &&
            typeof mapping.conditional.condition === 'function'
          ) {
            const condition = mapping.conditional.condition;
            const conditionalField = mapping.conditional.field;
            // Evaluate the condition based on one of the primary fields.
            const triggerValue =
              formData[field] && formData[field][mapping.fields[0]]
                ? formData[field][mapping.fields[0]]
                : null;
            if (condition(triggerValue)) {
              total++;
              if (
                formData[field] &&
                this.isFilled(formData[field][conditionalField])
              ) {
                filled++;
              }
            }
          }
        }
      }
    });

    return { filled, total };
  }

  /**
   * Helper to check if a value is considered "filled."
   * Adjust this logic based on your business rules.
   */
  private isFilled(value: any): boolean {
    // Reject null or undefined.
    if (value === null || value === undefined) {
      return false;
    }
    // For strings: ignore empty or whitespace-only values.
    if (typeof value === 'string' && value.trim().length === 0) {
      return false;
    }
    // For booleans: count only if true.
    if (typeof value === 'boolean') {
      return value === true;
    }
    // For numbers: you may decide if 0 should be considered unfilled.
    // Here we consider any number (even 0) as filled.
    return true;
  }

  /**
   * Aggregates progress across all components and emits overall percentage.
   * Also, optionally resets the overall progress if needed.
   */
  updateOverallProgress(reset: boolean = false): void {
    if (reset) {
      // Reset the overall progress to 0 when necessary
      this.progressSubject.next(0);
      return;
    }

    let totalFilled = 0;
    let totalRequired = 0;

    Object.values(this.componentProgress).forEach((progress) => {
      totalFilled += progress.filled;
      totalRequired += progress.total;
    });

    const overallPercentage =
      totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 100;

    this.progressSubject.next(overallPercentage);
  }

  /**
   * Method to reset the progress (e.g., on new application creation)
   */
  resetProgress(): void {
    this.componentProgress = {}; // Clear progress details
    this.updateOverallProgress(true); // Set progress to 0
  }
}
