import React, { useState } from 'react';

interface Materia {
  id: string;
  nome: string;
  anotacoes: string;
  links: { titulo: string; url: string }[];
}

export default function App() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaAtual, setMateriaAtual] = useState('');
  const [selecionada, setSelecionada] = useState<Materia | null>(null);

  // Formulário para novos links
  const [tituloLink, setTituloLink] = useState('');
  const [urlLink, setUrlLink] = useState('');

  const adicionarMateria = () => {
    if (!materiaAtual.trim()) return;
    const nova: Materia = {
      id: Date.now().toString(),
      nome: materiaAtual,
      anotacoes: '',
      links: []
    };
    setMaterias([...materias, nova]);
    setSelecionada(nova);
    setMateriaAtual('');
  };

  const salvarAnotacao = (texto: string) => {
    if (!selecionada) return;
    const atualizadas = materias.map((m) =>
      m.id === selecionada.id ? { ...m, anotacoes: texto } : m
    );
    setMaterias(atualizadas);
    setSelecionada({ ...selecionada, anotacoes: texto });
  };

  const adicionarLink = () => {
    if (!selecionada || !tituloLink || !urlLink) return;
    const novosLinks = [...selecionada.links, { titulo: tituloLink, url: urlLink }];
    const atualizadas = materias.map((m) =>
      m.id === selecionada.id ? { ...m, links: novosLinks } : m
    );
    setMaterias(atualizadas);
    setSelecionada({ ...selecionada, links: novosLinks });
    setTituloLink('');
    setUrlLink('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Menu Lateral */}
      <aside className="w-full md:w-64 bg-slate-800 p-4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-700">
        <h1 className="text-xl font-bold text-indigo-400">📚 Caderno Online</h1>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nova matéria..."
            value={materiaAtual}
            onChange={(e) => setMateriaAtual(e.target.value)}
            className="w-full px-3 py-1.5 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={adicionarMateria}
            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded font-bold text-sm"
          >
            +
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto">
          {materias.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelecionada(m)}
              className={`text-left px-3 py-2 rounded text-sm transition-all ${
                selecionada?.id === m.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              {m.nome}
            </button>
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        {selecionada ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-indigo-300 border-b border-slate-700 pb-2">
              {selecionada.nome}
            </h2>

            {/* Seção de Anotações e Resumos */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-slate-300">Resumo / Conteúdo da Aula:</label>
              <textarea
                rows={8}
                placeholder="Escreva suas anotações, fórmulas, resumos de provas aqui..."
                value={selecionada.anotacoes}
                onChange={(e) => salvarAnotacao(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
              />
            </div>

            {/* Seção de Links, Vídeos, PDFs e Provas */}
            <div className="flex flex-col gap-4 bg-slate-800 p-4 rounded border border-slate-700">
              <h3 className="font-semibold text-slate-200">Adicionar Materiais (Vídeos, PDFs, Fotos, Provas)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Título (Ex: Vídeo do YouTube / Drive de Provas)"
                  value={tituloLink}
                  onChange={(e) => setTituloLink(e.target.value)}
                  className="px-3 py-1.5 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="Link/URL (https://...)"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  className="px-3 py-1.5 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
              </div>

              <button
                onClick={adicionarLink}
                className="bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded font-bold text-sm w-full md:w-auto md:self-start md:px-6"
              >
                Anexar Link
              </button>

              {/* Lista de Links Salvos */}
              <div className="mt-2 flex flex-col gap-2">
                {selecionada.links.length > 0 ? (
                  selecionada.links.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-700 hover:bg-slate-650 rounded border border-slate-600 flex items-center justify-between text-sm text-indigo-300 hover:text-indigo-200"
                    >
                      <span>📌 {item.titulo}</span>
                      <span className="text-xs text-slate-400 underline">Abrir recurso</span>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum link ou PDF anexado ainda.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="text-4xl">📖</span>
            <p>Crie ou selecione uma matéria no menu lateral para começar a estudar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
