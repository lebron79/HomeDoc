import { useState, useMemo } from 'react';
import { BookOpen, ShieldAlert, Activity, Pill, Search } from 'lucide-react';
import Fuse from 'fuse.js';

const diseases = [
  {
    name: 'Common Cold',
    symptoms: 'Runny or stuffy nose, sore throat, cough, congestion, slight body aches, sneezing.',
    risks: 'Generally low-risk, but can lead to secondary infections like ear or sinus infections.',
    medications: 'Decongestants, pain relievers (e.g., Acetaminophen), cough suppressants.',
  },
  {
    name: 'Influenza (Flu)',
    symptoms: 'Fever, chills, muscle aches, cough, congestion, headache, fatigue.',
    risks: 'Can lead to serious complications like pneumonia, especially in high-risk groups.',
    medications: 'Antiviral drugs (e.g., Oseltamivir), pain relievers, fever reducers.',
  },
  {
    name: 'Hypertension (High Blood Pressure)',
    symptoms: 'Often has no symptoms, but can cause headaches, shortness of breath, or nosebleeds.',
    risks: 'Increases the risk of heart disease, stroke, and kidney disease.',
    medications: 'Diuretics, ACE inhibitors, Beta-blockers, Calcium channel blockers.',
  },
  {
    name: 'Type 2 Diabetes',
    symptoms: 'Increased thirst, frequent urination, hunger, fatigue, and blurred vision.',
    risks: 'Can lead to heart disease, nerve damage, kidney disease, and other serious conditions.',
    medications: 'Metformin, Sulfonylureas, Insulin therapy.',
  },
  {
    name: 'Asthma',
    symptoms: 'Shortness of breath, chest tightness, wheezing, and coughing.',
    risks: 'Can lead to severe asthma attacks, respiratory failure.',
    medications: 'Inhaled corticosteroids, Bronchodilators (e.g., Albuterol).',
  },
  {
    name: 'Migraine',
    symptoms: 'Severe headache, often on one side, accompanied by nausea, vomiting, and sensitivity to light and sound.',
    risks: 'Chronic migraines can impact quality of life; certain types may increase stroke risk.',
    medications: 'Pain relievers (e.g., Ibuprofen, Triptans), anti-nausea medications.',
  },
  {
    name: 'Gastroesophageal Reflux Disease (GERD)',
    symptoms: 'Heartburn, regurgitation, chest pain, difficulty swallowing.',
    risks: 'Can lead to esophagitis, esophageal strictures, and an increased risk of esophageal cancer.',
    medications: 'Antacids, H2 blockers (e.g., Famotidine), Proton pump inhibitors (e.g., Omeprazole).',
  },
  {
    name: 'Anxiety Disorder',
    symptoms: 'Excessive worry, restlessness, fatigue, difficulty concentrating, irritability, sleep disturbances.',
    risks: 'Can interfere with daily activities and lead to other mental and physical health problems.',
    medications: 'Antidepressants (e.g., SSRIs), Benzodiazepines (for short-term use), Buspirone.',
  },
  {
    name: 'Depression',
    symptoms: 'Persistent sad mood, loss of interest or pleasure, changes in appetite or sleep, fatigue, feelings of worthlessness.',
    risks: 'Can lead to impaired social functioning, substance abuse, and suicide.',
    medications: 'Antidepressants (e.g., SSRIs, SNRIs), psychotherapy.',
  },
  {
    name: 'Allergic Rhinitis (Hay Fever)',
    symptoms: 'Sneezing, runny or stuffy nose, itchy or watery eyes, itching of the nose or throat.',
    risks: 'Can affect quality of life and lead to sinus infections or asthma.',
    medications: 'Antihistamines (e.g., Loratadine), nasal corticosteroid sprays, decongestants.',
  },
  {
    name: 'Urinary Tract Infection (UTI)',
    symptoms: 'Pain or burning during urination, frequent urination, urgency, cloudy or strong-smelling urine.',
    risks: 'Can lead to kidney infection if left untreated.',
    medications: 'Antibiotics (e.g., Trimethoprim/sulfamethoxazole).',
  },
  {
    name: 'Eczema (Atopic Dermatitis)',
    symptoms: 'Dry, itchy, inflamed skin; may have red to brownish-gray patches.',
    risks: 'Can lead to skin infections and sleep problems.',
    medications: 'Topical corticosteroids, moisturizers, antihistamines.',
  },
  {
    name: 'Acne',
    symptoms: 'Pimples, blackheads, whiteheads, and cysts on the skin.',
    risks: 'Can cause scarring and emotional distress.',
    medications: 'Topical retinoids, benzoyl peroxide, oral antibiotics.',
  },
  {
    name: 'Insomnia',
    symptoms: 'Difficulty falling asleep, staying asleep, or waking up too early.',
    risks: 'Can lead to fatigue, irritability, and difficulty concentrating.',
    medications: 'Sleep aids (e.g., Zolpidem), cognitive behavioral therapy.',
  },
  {
    name: 'COVID-19',
    symptoms: 'Fever, cough, fatigue, loss of taste or smell, sore throat, headache, muscle aches.',
    risks: 'Can lead to severe respiratory illness, long COVID, and other long-term complications.',
    medications: 'Antiviral drugs (e.g., Paxlovid), supportive care, vaccination for prevention.',
  },
  {
    name: 'Strep Throat',
    symptoms: 'Sore throat, pain when swallowing, fever, red and swollen tonsils, tiny red spots on the roof of the mouth.',
    risks: 'Can lead to rheumatic fever or kidney inflammation if untreated.',
    medications: 'Antibiotics (e.g., Penicillin, Amoxicillin).',
  },
  {
    name: 'Conjunctivitis (Pink Eye)',
    symptoms: 'Redness, itching, and tearing of the eyes; may have a discharge.',
    risks: 'Highly contagious, but usually resolves without long-term problems.',
    medications: 'Antibiotic eye drops (for bacterial infection), antihistamines (for allergies).',
  },
];

const fuse = new Fuse(diseases, {
  keys: ['name', 'symptoms'],
  includeScore: true,
  threshold: 0.4,
});

export default function CommonDiseasesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDiseases = useMemo(() => {
    if (!searchTerm) {
      return diseases;
    }
    return fuse.search(searchTerm).map((result) => result.item);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-md mb-4">
            <BookOpen className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Health Knowledge Base</h1>
          <p className="text-lg text-gray-600">
            Explore common diseases, their symptoms, risks, and treatments.
          </p>
        </div>

        <div className="relative mb-8 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search for a disease..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 text-lg text-gray-800 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-6">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {filteredDiseases.map((disease) => (
            <div key={disease.name} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{disease.name}</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Symptoms</h3>
                      <p className="text-gray-600 text-sm">{disease.symptoms}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Risks</h3>
                      <p className="text-gray-600 text-sm">{disease.risks}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Medications</h3>
                      <p className="text-gray-600 text-sm">{disease.medications}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
