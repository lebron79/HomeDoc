import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSEO = {
  title: 'HomeDoc - AI-Powered Health Diagnosis & Telemedicine Platform',
  description: 'Get instant AI-powered health assessments, connect with certified doctors online, and manage your health from home. Symptom checking, disease prediction, and telemedicine consultations.',
  keywords: 'telemedicine, AI health diagnosis, online doctor consultation, symptom checker, disease prediction, health assessment, virtual healthcare, online pharmacy',
  image: 'https://lebron79.github.io/HomeDoc/og-image.png',
  url: 'https://lebron79.github.io/HomeDoc/',
  type: 'website',
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | HomeDoc` : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    type: type || defaultSEO.type,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
    </Helmet>
  );
}

// Pre-configured SEO for specific pages
export const PageSEO = {
  Home: () => <SEO />,
  
  Login: () => (
    <SEO
      title="Login"
      description="Sign in to your HomeDoc account to access AI health assessments, doctor consultations, and manage your health records."
      url="https://lebron79.github.io/HomeDoc/#/login"
    />
  ),
  
  Register: () => (
    <SEO
      title="Create Account"
      description="Join HomeDoc today for free AI-powered health assessments, connect with certified doctors, and take control of your health journey."
      url="https://lebron79.github.io/HomeDoc/#/register"
    />
  ),
  
  SymptomChecker: () => (
    <SEO
      title="AI Symptom Checker"
      description="Use our advanced AI symptom checker to analyze your symptoms and get instant health insights. Free, accurate, and confidential health assessment."
      keywords="symptom checker, AI diagnosis, health assessment, medical symptoms, disease detection"
      url="https://lebron79.github.io/HomeDoc/#/symptom-checker"
    />
  ),
  
  DiseasePrediction: () => (
    <SEO
      title="AI Disease Prediction"
      description="Get AI-powered disease predictions based on your symptoms. Our machine learning model analyzes patterns to suggest possible conditions."
      keywords="disease prediction, AI diagnosis, symptom analysis, health AI, medical prediction"
      url="https://lebron79.github.io/HomeDoc/#/disease-prediction"
    />
  ),
  
  Medications: () => (
    <SEO
      title="Online Pharmacy"
      description="Browse and order medications online from HomeDoc's trusted pharmacy. Get prescribed medications delivered to your doorstep."
      keywords="online pharmacy, buy medications, prescription drugs, medicine delivery, health store"
      url="https://lebron79.github.io/HomeDoc/#/medications"
    />
  ),
  
  FindDoctor: () => (
    <SEO
      title="Find a Doctor"
      description="Connect with certified healthcare professionals for online consultations. Browse doctors by specialty and book appointments instantly."
      keywords="find doctor, online consultation, telemedicine, doctor appointment, healthcare professional"
      url="https://lebron79.github.io/HomeDoc/#/find-doctor"
    />
  ),
  
  CommonDiseases: () => (
    <SEO
      title="Common Diseases Guide"
      description="Learn about common diseases, their symptoms, causes, and treatments. Comprehensive health information to help you stay informed."
      keywords="common diseases, health guide, disease symptoms, medical information, health education"
      url="https://lebron79.github.io/HomeDoc/#/common-diseases"
    />
  ),
  
  PatientDashboard: () => (
    <SEO
      title="Patient Dashboard"
      description="Manage your health records, view consultation history, and track your health journey with HomeDoc's patient dashboard."
      url="https://lebron79.github.io/HomeDoc/#/patient"
    />
  ),
  
  DoctorDashboard: () => (
    <SEO
      title="Doctor Dashboard"
      description="Healthcare provider portal for managing patient consultations, reviewing cases, and providing telemedicine services."
      url="https://lebron79.github.io/HomeDoc/#/doctor"
    />
  ),
};
