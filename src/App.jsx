// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LZString from 'lz-string';
import StepForm from './StepForm.jsx';
import Summary from './Summary.jsx';
import HelpPanel from './HelpPanel.jsx';

// --- Constants & Utility Functions (Outside Component) ---

const steps = [
    { id: 'analyse', title: 'Analyse', description: 'Analyser les besoins, le public cible et les objectifs pédagogiques.', checklist: ['Définir le public cible', 'Lister les objectifs pédagogiques', 'Identifier les contraintes'], help: 'Déterminez qui sont les apprenants, ce qu’ils doivent apprendre, et les ressources disponibles.', example: 'Public cible : Étudiants en informatique, 18-22 ans, débutants.\nObjectifs : Maîtriser les bases de Python (variables, boucles).\nContraintes : Budget limité, 4 semaines.' },
    { id: 'design', title: 'Design', description: 'Concevoir les objectifs, le contenu et les stratégies pédagogiques.', checklist: ['Formuler des objectifs spécifiques', 'Planifier le contenu', 'Choisir des stratégies pédagogiques'], help: 'Planifiez la structure de la formation avec des objectifs mesurables.', example: 'Objectifs : Comprendre les types de données en 1 semaine.\nContenu : Vidéos et quiz sur les variables.\nStratégies : Apprentissage actif avec exercices.' },
    { id: 'developpement', title: 'Développement', description: 'Créer les supports pédagogiques et les activités.', checklist: ['Créer des supports (vidéos, quiz)', 'Choisir des outils', 'Tester les supports'], help: 'Produisez des matériaux testés pour garantir leur efficacité.', example: 'Supports : 6 vidéos, 20 exercices sur Replit.\nOutils : Camtasia, Moodle.\nTests : Pilote avec 10 étudiants.' },
    { id: 'implementation', title: 'Implémentation', description: 'Mettre en œuvre la formation ou le cours.', checklist: ['Planifier le déploiement', 'Établir un calendrier', 'Fournir un support'], help: 'Assurez un accès facile et un support pour les apprenants.', example: 'Déploiement : Moodle, lien unique.\nCalendrier : 4 semaines, début 1er juin.\nSupport : Forum et FAQ.' },
    { id: 'evaluation', title: 'Évaluation', description: 'Évaluer les résultats et ajuster le contenu.', checklist: ['Choisir des méthodes d’évaluation', 'Définir des critères de succès', 'Planifier des ajustements'], help: 'Mesurez l’efficacité avec des quiz ou enquêtes.', example: 'Méthodes : Quiz hebdomadaires, projet final.\nCritères : 80% de complétion.\nAjustements : Mise à jour des vidéos.' }
];

const templates = [
    { name: 'Formation en ligne', data: { analyse: { text: 'Public : Adultes, 25-40 ans, professionnels.\nObjectifs : Maîtriser Excel.\nContraintes : 6 semaines, accès en ligne.', checklist: steps[0].checklist.map(t => ({ text: t, checked: true })) }, design: { text: 'Objectifs : Créer des tableaux dynamiques.\nContenu : Vidéos et exercices.\nStratégies : Apprentissage par projet.', checklist: steps[1].checklist.map(t => ({ text: t, checked: true })) }, developpement: { text: 'Supports : 8 vidéos, 15 exercices.\nOutils : Articulate, LMS.\nTests : Pilote avec 5 apprenants.', checklist: steps[2].checklist.map(t => ({ text: t, checked: true })) }, implementation: { text: 'Déploiement : LMS, accès par mot de passe.\nCalendrier : 6 semaines.\nSupport : Chat en ligne.', checklist: steps[3].checklist.map(t => ({ text: t, checked: true })) }, evaluation: { text: 'Méthodes : Quiz, projet final.\nCritères : 75% de réussite.\nAjustements : Ajout de ressources.', checklist: steps[4].checklist.map(t => ({ text: t, checked: true })) } } },
    { name: 'Atelier en présentiel', data: { analyse: { text: 'Public : Enseignants, 30-50 ans.\nObjectifs : Intégrer le numérique.\nContraintes : 1 jour, budget limité.', checklist: steps[0].checklist.map(t => ({ text: t, checked: true })) }, design: { text: 'Objectifs : Utiliser des outils numériques.\nContenu : Démonstrations, exercices.\nStratégies : Apprentissage pratique.', checklist: steps[1].checklist.map(t => ({ text: t, checked: true })) }, developpement: { text: 'Supports : Diapos, fiches pratiques.\nOutils : PowerPoint, tablettes.\nTests : Répétition avec collègues.', checklist: steps[2].checklist.map(t => ({ text: t, checked: true })) }, implementation: { text: 'Déploiement : Salle équipée.\nCalendrier : 1 jour.\nSupport : Animateur sur place.', checklist: steps[3].checklist.map(t => ({ text: t, checked: true })) }, evaluation: { text: 'Méthodes : Enquête, exercices.\nCritères : 90% de satisfaction.\nAjustements : Ajout de temps pratique.', checklist: steps[4].checklist.map(t => ({ text: t, checked: true })) } } }
];

const compressData = (data) => {
  try {
    const json = JSON.stringify(data);
    return LZString.compressToUTF16(json);
  } catch (error) {
    console.error("Erreur de compression LZString:", error);
    return '';
  }
};

const decompressData = (compressed) => {
  if (!compressed) return {};
  try {
    const decompressed = LZString.decompressFromUTF16(compressed);
    if (decompressed) {
        return JSON.parse(decompressed) || {};
    }
    console.warn("Échec de la décompression LZString (données invalides ?)");
    return {};
  } catch (error) {
    console.error("Erreur lors de la décompression/parsing localStorage:", error);
    return {};
  }
};

const analyzeData = (allData, step) => {
  if (!step || typeof step.id === 'undefined') {
      console.error("analyzeData: Étape invalide reçue", step);
      return { summary: 'Erreur interne.', issues: [], suggestions: [], coherence: '' };
  }
  if (!allData) return { summary: '', issues: [], suggestions: [], coherence: '' };

  const text = allData[step.id]?.text || '';
  const issues = [];
  const suggestions = [];
  let coherence = '';

  if (!text.trim()) {
    issues.push('Champ vide.');
    return { summary: 'Aucune donnée saisie.', issues, suggestions, coherence };
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 10) issues.push('Texte très court.');
  if (words > 500) issues.push('Texte > 500 mots.');

  const hasObjectives = /objectif(s)?/i.test(text);
  if (!hasObjectives && (step.id === 'analyse' || step.id === 'design')) {
    suggestions.push('Pensez à formuler des objectifs clairs.');
  }

  if (step.id === 'analyse' && !/public\s+cible/i.test(text)) suggestions.push('Précisez le public cible.');
  if (step.id === 'design' && !/stratégie(s)?/i.test(text)) suggestions.push('Mentionnez les stratégies pédagogiques.');
  if (step.id === 'evaluation' && !/critère(s)?/i.test(text)) suggestions.push('Définissez des critères de succès.');

  if (step.id === 'design' && allData.analyse?.text) {
    const analyseHasObjectives = /objectif(s)?/i.test(allData.analyse.text);
    if (analyseHasObjectives && !hasObjectives) {
      coherence = 'Suggestion : Assurez-vous que les objectifs de l\'Analyse sont repris.';
    }
  }

  return {
    summary: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
    issues,
    suggestions,
    coherence
  };
};

// --- App Component ---
const App = () => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState(() => decompressData(localStorage.getItem('addieData')));
  const [errors, setErrors] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('addieData'));

  // Auto-save effect
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const compressed = compressData(data);
        if (compressed) {
            localStorage.setItem('addieData', compressed);
            setSaveNotification(true);
            const notificationTimeout = setTimeout(() => setSaveNotification(false), 1500);
            return () => clearTimeout(notificationTimeout);
        }
      } catch (error) {
         if (error.name === 'QuotaExceededError') {
             alert("Erreur sauvegarde : Stockage local plein.");
         } else {
             console.error("Erreur sauvegarde localStorage:", error);
             alert("Erreur sauvegarde inconnue.");
         }
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [data]);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowLeft' && currentStep > 0) prevStep();
      else if (event.key === 'ArrowRight' && currentStep < steps.length) nextStep();
      else if ((event.key === 'h' || event.key === '?') && currentStep < steps.length) setShowHelp(s => !s);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, /* nextStep, prevStep have stable refs via useCallback */]);

  // Validation function
  const validateStep = useCallback((stepId) => {
    const text = data[stepId]?.text || '';
    let isValid = true;
    let errorMsg = '';
    if (!text.trim()) { errorMsg = 'Champ requis.'; isValid = false; }
    else if (text.split(/\s+/).filter(Boolean).length > 500) { errorMsg = 'Max. 500 mots.'; isValid = false; }
    setErrors(prev => ({ ...prev, [stepId]: errorMsg }));
    return isValid;
  }, [data]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < steps.length && !validateStep(steps[currentStep].id)) return;
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Template loading function
  const loadTemplate = useCallback((templateData) => {
    if (!templateData || typeof templateData !== 'object') { alert('Modèle invalide.'); return; }
    if (window.confirm("Charger ce modèle écrasera les données actuelles. Continuer ?")) {
      try {
        setData(templateData); setCurrentStep(0); setShowWelcome(false); setErrors({});
      } catch(error) { console.error("Erreur chargement modèle:", error); alert('Erreur chargement modèle.'); }
    }
  }, []);

  // Export function (print)
  const exportToPDF = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      try { window.print(); }
      catch(error) { console.error("Erreur window.print:", error); alert('Erreur impression.'); }
      finally { setTimeout(() => setIsExporting(false), 1000); }
    }, 100);
  }, []);

  // Reset function
  const resetData = useCallback(() => {
    if (window.confirm("Supprimer toutes les données ? Irréversible.")) {
      setData({}); setErrors({}); setCurrentStep(0); setShowWelcome(true);
      const templateSelect = document.getElementById("template-select");
      if(templateSelect) templateSelect.value = "";
    }
  }, []);

  // Memoized progress calculation
  const progress = useMemo(() => {
    const filledSteps = steps.filter(step => data[step.id]?.text?.trim()).length;
    return Math.round((filledSteps / steps.length) * 100);
  }, [data]);

  // Memoized step buttons generation
  const stepButtons = useMemo(() => (
    steps.map((step, index) => (
      <button
        key={step.id}
        className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 no-print transition-colors duration-150 ${
          currentStep === index ? 'bg-blue-600 text-white font-semibold shadow-sm'
          : data[step.id]?.text?.trim() ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${errors[step.id] ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}
        onClick={() => setCurrentStep(index)}
        aria-label={`Aller à ${step.title}${errors[step.id] ? ' (erreur)' : ''}${data[step.id]?.text?.trim() ? ' (complétée)' : ''}`}
        aria-current={currentStep === index ? 'step' : undefined}
      >
        {step.title}
      </button>
    ))
  ), [currentStep, data, errors]);

  // JSX Render
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex-grow flex flex-col"> {/* Main container */}

      {/* Welcome Modal */}
      {showWelcome && (
         <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-200 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Bienvenue dans ADDIE Pro !</h3>
            <p className="text-gray-600 text-sm mb-5">Structurez vos projets pédagogiques...</p>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-md..." onClick={() => setShowWelcome(false)}>Démarrer</button>
          </div>
        </div>
      )}

      {/* Save Notification */}
      {saveNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow-md z-40 no-print animate-fade-in-out" role="status" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          Enregistré
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3 border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">ADDIE Pro</h1>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 no-print">
          {/* Template Selector */}
          <select id="template-select" className="px-3 py-1.5 bg-white border..." onChange={e => e.target.value && loadTemplate(templates[parseInt(e.target.value, 10)].data)} defaultValue="">
            <option value="" disabled>Charger modèle...</option>
            {templates.map((template, index) => ( <option key={template.name} value={index}>{template.name}</option> ))}
          </select>
          {/* Help Button */}
          <button className="px-3 py-1.5 bg-blue-100 text-blue-700..." onClick={() => setShowHelp(true)} disabled={currentStep >= steps.length} title={currentStep < steps.length ? "Afficher l'aide (H)" : "Aide non disponible"}>Aide (?)</button>
          {/* Reset Button */}
          <button className="px-3 py-1.5 bg-red-100 text-red-700..." onClick={resetData} title="Supprimer toutes les données">Réinitialiser</button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-5 no-print">
        <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Progression globale</span><span className="font-medium">{progress}%</span></div>
        <div className="w-full bg-gray-200 rounded-full h-2.5..." title={`Progression : ${progress}%`}>
          <div className="bg-gradient-to-r from-blue-500..." style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress}></div>
        </div>
      </div>

      {/* Step Navigation Buttons */}
      <nav className="flex justify-center space-x-1 sm:space-x-2 mb-6 flex-wrap gap-y-2 no-print" aria-label="Navigation des étapes">
        {stepButtons}
        {/* Summary Button */}
        <button className={`px-3 py-1 rounded-md text-sm... ${currentStep === steps.length ? 'bg-blue-600 text-white...' : 'bg-gray-200...'}`} onClick={() => { if (currentStep === steps.length - 1 && !validateStep(steps[currentStep].id)) return; setCurrentStep(steps.length);}} aria-label="Aller au résumé" aria-current={currentStep === steps.length ? 'page' : undefined}>Résumé</button>
      </nav>

      {/* Main Content Area (Step Form or Summary) */}
      <main className="flex-grow mb-6">
        {currentStep < steps.length ? (
          <StepForm key={steps[currentStep].id} step={steps[currentStep]} data={data} setData={setData} errors={errors} />
        ) : (
          // Pass analyzeData as a prop here
          <Summary data={data} exportToPDF={exportToPDF} isExporting={isExporting} steps={steps} analyzeData={analyzeData} />
        )}
      </main>

      {/* Help Panel Modal */}
      {showHelp && currentStep < steps.length && ( <HelpPanel step={steps[currentStep]} data={data} setData={setData} onClose={() => setShowHelp(false)} /> )}

      {/* Prev/Next Navigation Footer */}
      <footer className="flex justify-between mt-auto pt-4 no-print border-t border-gray-200">
        <button className="px-4 py-2 bg-gray-300..." onClick={prevStep} disabled={currentStep === 0} aria-label="Étape précédente (Flèche gauche)">&larr; Précédent</button>
        <button className="px-4 py-2 bg-blue-600 text-white..." onClick={nextStep} disabled={currentStep >= steps.length} aria-label={currentStep === steps.length - 1 ? "Voir le résumé (Flèche droite)" : "Étape suivante (Flèche droite)"}>{currentStep === steps.length - 1 ? "Voir le résumé" : "Suivant"} &rarr;</button>
      </footer>
    </div>
  );
};

export default App;
