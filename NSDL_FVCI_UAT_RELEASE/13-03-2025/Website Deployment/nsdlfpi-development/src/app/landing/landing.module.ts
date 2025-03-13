import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from '../standalone/shared/header/header.component';
import { FooterComponent } from '../standalone/shared/footer/footer.component';
import { QuestionsComponent } from './layout/questions/questions.component';
import { FeaturesAndBenefitsComponent } from './layout/features-and-benefits/features-and-benefits.component';
import { SingleWindowServicesComponent } from './layout/single-window-services/single-window-services.component';
import { ValueAddedServicesComponent } from './layout/value-added-services/value-added-services.component';
import { WhyNsdlComponent } from './layout/why-nsdl/why-nsdl.component';
import { HeroSectionComponent } from './layout/hero-section/hero-section.component';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FaqComponent } from './layout/faq/faq.component';
import { FaqDetailComponent } from './layout/faq/faq-detail/faq-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  declarations: [
    LayoutComponent,
    QuestionsComponent,
    FeaturesAndBenefitsComponent,
    SingleWindowServicesComponent,
    ValueAddedServicesComponent,
    WhyNsdlComponent,
    HeroSectionComponent,
    FaqComponent,
    FaqDetailComponent,
  ],
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    LandingRoutingModule,
    AccordionModule,
    TooltipModule,
    ButtonModule,
    CardModule,
    MenubarModule,
    RouterModule,
  ],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    [provideHttpClient()],
    provideClientHydration(),
  ],
})
export class LandingModule {}
