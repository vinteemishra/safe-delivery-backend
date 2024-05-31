import React from "react";
import MainContainer from "./containers/MainContainer";
import AdminContainer from "./containers/AdminContainer";
import AdminEventCheckContainer from "./containers/AdminEventCheckContainer";
import ContentContainer from "./containers/ContentContainer";
import AboutContainer from "./containers/AboutContainer";
import LanguagesContainer from "./containers/LanguagesContainer";
import ModuleContainer from "./containers/ModuleContainer";
import ProceduresContainer from "./containers/ProceduresContainer";
import DrugsContainer from "./containers/DrugsContainer";
import OnboardingContainer from "./containers/OnboardingContainer";
import NotificationsContainer from "./containers/NotificationsContainer";
import ActionCardsContainer from "./containers/ActionCardsContainer";
import ActionCardsChaptersContainer from "./containers/ActionCardsChaptersContainer";
import ProceduresChaptersContainer from "./containers/ProceduresChaptersContainer";
import CertificatesContainer from "./containers/CertificatesContainer";
// import CertificatesQuestionsContainer from './containers/CertificatesQuestionsContainer';
// import TranslatedCertificateQuestionForm from './components/TranslatedCertificateQuestionForm';
import CasesContainer from "./containers/CasesContainer";
import CasesQuestionsContainer from "./containers/CasesQuestionsContainer";
import TranslatedCasesQuestionForm from "./components/TranslatedCasesQuestionForm";
import KeyLearningPointsContainer from "./containers/KeyLearningPointsContainer";
import KeyLearningPointsQuestionsContainer from "./containers/KeyLearningPointsQuestionsContainer";
import TranslatedKeyLearningPointQuestionForm from "./components/TranslatedKeyLearningPointQuestionForm";
import { RelativeFragment, AbsoluteFragment } from "redux-little-router";
import ScreensForm from "./components/ScreensForm";
import AboutForm from "./components/AboutForm";
import ActionCardForm from "./components/ActionCardForm";
import ProcedureForm from "./components/ProcedureForm";
import DrugForm from "./components/DrugForm";
import OnboardingForm from "./components/OnboardingForm";
import CertificateIntroForm from "./components/CertificateIntroForm";
import NotificationForm from "./components/NotificationForm";
import ModuleCategoriesContainer from "./containers/ModuleCategoriesContainer";

export const AdminFragments = () => (
  <section>
    <AbsoluteFragment forRoute="/">
      <MainContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/admin">
      <AdminContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/admin/events">
      <AdminEventCheckContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters">
      <ContentContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/module-categories/:moduleCategoryKey">
      <ModuleCategoriesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/about">
      <AboutContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/procedures">
      <ProceduresContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/procedures/:docKey">
      <ProceduresChaptersContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/procedures/:docKey/:chapterKey">
      <ProcedureForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/action-cards">
      <ActionCardsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/action-cards/:docKey">
      <ActionCardsChaptersContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/action-cards/:docKey/:chapterKey">
      <ActionCardForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/key-learning-points">
      <KeyLearningPointsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/key-learning-points/:parentKey">
      <KeyLearningPointsQuestionsContainer />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/masters/cases">
      <CasesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/cases/:parentKey">
      <CasesQuestionsContainer />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/masters/certificates">
      <CertificatesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/certificates/:parentKey">
      <CertificateIntroForm />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/masters/drugs">
      <DrugsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/drugs/:drugKey">
      <DrugForm />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/masters/onboarding">
      <OnboardingContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/onboarding/:onbKey">
      <OnboardingForm />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/masters/notifications">
      <NotificationsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/masters/notifications/:notificationKey">
      <NotificationForm />
    </AbsoluteFragment>

    {/* <AbsoluteFragment forRoute='/languages'><LanguagesContainer/></AbsoluteFragment> */}
    <RelativeFragment forRoute="/masters">
      <RelativeFragment forRoute="/screens">
        <ScreensForm />
      </RelativeFragment>
      <RelativeFragment forRoute="/languages">
        <LanguagesContainer />
      </RelativeFragment>
      <RelativeFragment forRoute="/about">
        <RelativeFragment forRoute="/:section">
          <AboutForm />
        </RelativeFragment>
      </RelativeFragment>
    </RelativeFragment>
  </section>
);

export const AppFragments = () => (
  <section>
    <AbsoluteFragment forRoute="/languages">
      <LanguagesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId">
      <ContentContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/about">
      <AboutContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/modules/:moduleKey">
      <ModuleContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/procedures">
      <ProceduresContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/procedures/:docKey">
      <ProceduresChaptersContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/procedures/:docKey/:chapterKey">
      <ProcedureForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/action-cards">
      <ActionCardsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/action-cards/:docKey">
      <ActionCardsChaptersContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/action-cards/:docKey/:chapterKey">
      <ActionCardForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/drugs">
      <DrugsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/drugs/:drugKey">
      <DrugForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/onboarding">
      <OnboardingContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/onboarding/:onbKey">
      <OnboardingForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/notifications">
      <NotificationsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/notifications/:notificationKey">
      <NotificationForm />
    </AbsoluteFragment>

    <AbsoluteFragment forRoute="/languages/:langId/key-learning-points">
      <KeyLearningPointsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/key-learning-points/:parentKey">
      <KeyLearningPointsQuestionsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/key-learning-points/:parentKey/:questionKey">
      <TranslatedKeyLearningPointQuestionForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/certificates">
      <CertificatesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/certificates/:parentKey">
      <CertificateIntroForm />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/cases">
      <CasesContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/cases/:parentKey">
      <CasesQuestionsContainer />
    </AbsoluteFragment>
    <AbsoluteFragment forRoute="/languages/:langId/cases/:parentKey/:questionKey">
      <TranslatedCasesQuestionForm />
    </AbsoluteFragment>
    <RelativeFragment forRoute="/languages/:langId">
      <RelativeFragment forRoute="/screens">
        <ScreensForm />
      </RelativeFragment>
      <RelativeFragment forRoute="/about">
        <RelativeFragment forRoute="/:section">
          <AboutForm />
        </RelativeFragment>
      </RelativeFragment>
    </RelativeFragment>
  </section>
);
