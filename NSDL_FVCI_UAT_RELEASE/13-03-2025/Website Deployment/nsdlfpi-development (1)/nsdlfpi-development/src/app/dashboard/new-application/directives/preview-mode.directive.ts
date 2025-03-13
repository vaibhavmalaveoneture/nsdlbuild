import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPreviewMode]',
  standalone: true
})
export class PreviewModeDirective implements OnInit {
  @Input() appPreviewMode: boolean = false;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {
    if (this.appPreviewMode) {
      // Add preview-mode class to the element
      this.renderer.addClass(this.el.nativeElement, 'preview-mode');
      
      // Disable all form controls within the element
      this.disableFormControls(this.el.nativeElement);
    }
  }
  
  private disableFormControls(element: HTMLElement) {
    // Find all standard form controls
    const inputs = element.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      this.renderer.setAttribute(input, 'disabled', 'true');
    });
    
    // Find PrimeNG specific controls - expanded list to include all used components
    const primeNgControls = element.querySelectorAll(
      '.p-dropdown, .p-multiselect, .p-calendar, .p-checkbox, .p-radiobutton, ' +
      'p-dropdown, p-multiselect, p-calendar, p-checkbox, p-radiobutton, ' +
      'p-check-box, p-select, p-datepicker, p-accordion, p-table, ' +
      '.p-inputtext, .p-button, p-button, p-accordion, p-table'
    );
    
    primeNgControls.forEach(control => {
      this.renderer.addClass(control, 'p-disabled');
      
      // For PrimeNG elements that use internal tabindex
      const interactiveElements = control.querySelectorAll('[tabindex="0"]');
      interactiveElements.forEach(el => {
        this.renderer.setAttribute(el, 'tabindex', '-1');
      });
    });
    
    // Hide all action buttons, add buttons, and accordion controls
    const actionButtons = element.querySelectorAll(
      '.action-buttons, .button-wrapper, .p-button, .p-button-rounded, ' +
      'p-button[icon="pi pi-plus"], p-button[icon="pi pi-trash"], .not-applicable'
    );
    
    actionButtons.forEach(button => {
      this.renderer.setStyle(button, 'display', 'none');
    });
    
    // Additionally disable accordion headers to prevent expanding/collapsing
    const accordionHeaders = element.querySelectorAll('.p-accordion-header');
    accordionHeaders.forEach(header => {
      this.renderer.addClass(header, 'p-disabled');
    });
  }
}