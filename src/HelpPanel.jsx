import React from 'react';

const HelpPanel = React.memo(({ step, data, setData, onClose }) => {
  const text = data[step.id]?.text || '';
  const recommendations = [];
  if (!text.trim()) recommendations.push('Commencez par remplir le champ texte avec des détails.');
  if (!/objectif/i.test(text)) recommendations.push('Ajoutez des objectifs mesurables (ex. : "Les apprenants seront capables de...").');
  if (text.split(/\s+/).length < 10) recommendations.push('Développez vos idées avec plus de détails.');

  const applyExample = () => {
    setData(prev => ({
      ...prev,
      [step.id]: { text: step.example, checklist: step.checklist.map(text => ({ text, checked: true })) }
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{step.help}</p>
        <p className="text-sm font-medium text-gray-900 mb-2">Recommandations :</p>
        <ul className="list-disc pl-4 text-sm text-gray-600 mb-3">
          {recommendations.length > 0 ? recommendations.map((rec, idx) => <li key={idx}>{rec}</li>) : <li>Aucune recommandation : vos entrées semblent complètes !</li>}
        </ul>
        <p className="text-sm font-medium text-gray-900 mb-2">Exemple :</p>
        <p className="text-sm text-gray-600 mb-3">{step.example}</p>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm focus:ring-2 focus:ring-blue-600"
            onClick={applyExample}
            aria-label="Appliquer l'exemple"
          >
            Appliquer l'exemple
          </button>
          <button
            className="px-3 py-1 bg-gray-300 text-gray-900 rounded-md text-sm focus:ring-2 focus:ring-gray-500"
            onClick={onClose}
            aria-label="Fermer le panneau d'aide"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
});

export default HelpPanel;