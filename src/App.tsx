import React, { useState, useEffect } from 'react';

interface LinkItem {
  id: string;
  titulo: string;
  url: string;
}

interface ArquivoLocal {
  id: string;
  nome: string;
  tipo: string;
  dadosBase64: string; // permite guardar imagens/documentos localmente
}

interface LembreteProva {
  id: string;
  titulo: string;
  data: string;
  concluido: boolean;
}

interface Materia {
  id: string;
  nome: string;
  anotacoes: string;
  links: LinkItem[];
  arquivos: ArquivoLocal[];
  lembretes: LembreteProva[];
}

export default function App() {
  const [materias, setMaterias] = useState<Materia[]>(() => {
    const salvos = localStorage.getItem('caderno_estudos_dados');
    return salvos ? JSON.parse(salvos) : [];
  });

  const [materiaAtual, setMateriaAtual] = useState('');
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);

  // Formulários auxiliares
  const [tituloLink, setTituloLink] = useState('');
  const [urlLink, setUrlLink] = useState('');

  const [tituloLembrete, setTituloLembrete] = useState('');
  const [dataLembrete, setDataLembrete] = useState('');

  // Salva no navegador sempre que alterar algo
  useEffect(() => {
    localStorage.setItem('caderno_estudos_dados', JSON.stringify(materias));
  }, [materias]);

  const selecionada = materias.find((m) => m.id === selecionadaId) || null;

  // Adicionar e Excluir Matéria
  const adicionarMateria = () => {
    if (!materiaAtual.trim()) return;
    const nova: Materia = {
      id: Date.now().toString(),
      nome: materiaAtual,
      anotacoes: '',
      links: [],
      arquivos: [],
      lembretes: [],
    };
    setMaterias([...materias, nova]);
    setSelecionadaId(nova.id);
    setMateriaAtual('');
  };

  const excluirMateria = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta matéria inteira?')) {
      const atualizadas = materias.filter((m) => m.id !== id);
      setMaterias(atualizadas);
      if (selecionadaId === id) {
        setSelecionadaId(atualizadas[0]?.id || null);
      }
    }
  };

  // Atualizar Anotações
  const salvarAnotacao = (texto: string) => {
    if (!selecionadaId) return;
    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId ? { ...m, anotacoes: texto } : m
      )
    );
  };

  // Links (Adicionar e Excluir)
  const adicionarLink = () => {
    if (!selecionadaId || !tituloLink.trim() || !urlLink.trim()) return;
    
    // Ajusta URL para garantir http/https
    let urlFinal = urlLink.trim();
    if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
      urlFinal = 'https://' + urlFinal;
    }

    const novoLink: LinkItem = {
      id: Date.now().toString(),
      titulo: tituloLink.trim(),
      url: urlFinal,
    };

    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId ? { ...m, links: [...m.links, novoLink] } : m
      )
    );
    setTituloLink('');
    setUrlLink('');
  };

  const excluirLink = (linkId: string) => {
    if (!selecionadaId) return;
    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId
          ? { ...m, links: m.links.filter((l) => l.id !== linkId) }
          : m
      )
    );
  };

  // Carregar fotos e arquivos do dispositivo
  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selecionadaId || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const novoArq: ArquivoLocal = {
        id: Date.now().toString(),
        nome: file.name,
        tipo: file.type,
        dadosBase64: reader.result as string,
      };

      setMaterias(
        materias.map((m) =>
          m.id === selecionadaId
            ? { ...m, arquivos: [...m.arquivos, novoArq] }
            : m
        )
      );
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // reseta input
  };

  const excluirArquivo = (arqId: string) => {
    if (!selecionadaId) return;
    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId
          ? { ...m, arquivos: m.arquivos.filter((a) => a.id !== arqId) }
          : m
      )
    );
  };

  // Lembretes / Provas
  const adicionarLembrete = () => {
    if (!selecionadaId || !tituloLembrete.trim() || !dataLembrete) return;
    const novoLembrete: LembreteProva = {
      id: Date.now().toString(),
      titulo: tituloLembrete.trim(),
      data: dataLembrete,
      concluido: false,
    };

    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId
          ? { ...m, lembretes: [...m.lembretes, novoLembrete] }
          : m
      )
    );
    setTituloLembrete('');
    setDataLembrete('');
  };

  const toggleLembrete = (lembreteId: string) => {
    if (!selecionadaId) return;
    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId
          ? {
              ...m,
              lembretes: m.lembretes.map((l) =>
                l.id === lembreteId ? { ...l, concluido: !l.concluido } : l
              ),
            }
          : m
      )
    );
  };

  const excluirLembrete = (lembreteId: string) => {
    if (!selecionadaId) return;
    setMaterias(
      materias.map((m) =>
        m.id === selecionadaId
          ? { ...m, lembretes: m.lembretes.filter((l) => l.id !== lembreteId) }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Menu Lateral */}
      <aside className="w-full md:w-72 bg-slate-800 p-4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-400">📚 Caderno Online</h1>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nova matéria..."
            value={materiaAtual}
            onChange={(e) => setMateriaAtual(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={adicionarMateria}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded font-bold text-sm transition-colors"
          >
            +
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto max-h-60 md:max-h-none">
          {materias.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelecionadaId(m.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded text-sm cursor-pointer transition-all ${
                selecionadaId === m.id
                  ? 'bg-indigo-600 text-white font-medium shadow'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span className="truncate">{m.nome}</span>
              <button
                onClick={(e) => excluirMateria(m.id, e)}
                title="Excluir matéria"
                className="text-xs opacity-60 hover:opacity-100 hover:text-red-300 ml-2 px-1"
              >
                ✕
              </button>
            </div>
          ))}
          {materias.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Nenhuma matéria criada.</p>
          )}
        </nav>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {selecionada ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 border-b border-slate-700 pb-3">
              {selecionada.nome}
            </h2>

            {/* 1. Lembretes e Provas */}
            <div className="bg-slate-800 p-4 md:p-5 rounded-lg border border-slate-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
                <span>🗓️</span> Provas & Lembretes
              </h3>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Ex: Prova de Físico-Química"
                  value={tituloLembrete}
                  onChange={(e) => setTituloLembrete(e.target.value)}
                  className="flex-1 px-3 py-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
                <input
                  type="date"
                  value={dataLembrete}
                  onChange={(e) => setDataLembrete(e.target.value)}
                  className="px-3 py-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
                <button
                  onClick={adicionarLembrete}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-bold transition-colors"
                >
                  Agendar
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {selecionada.lembretes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-750 bg-slate-700/50 p-2.5 rounded border border-slate-650 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.concluido}
                        onChange={() => toggleLembrete(item.id)}
                        className="w-4 h-4 accent-indigo-500 cursor-pointer"
                      />
                      <span className={item.concluido ? 'line-through text-slate-400' : 'text-slate-100'}>
                        {item.titulo} — <strong className="text-indigo-300">{item.data}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => excluirLembrete(item.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Anotações */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-slate-200 flex items-center gap-2">
                <span>✏️</span> Anotações & Resumos:
              </label>
              <textarea
                rows={7}
                placeholder="Escreva seus resumos, conteúdos, conceitos importantes..."
                value={selecionada.anotacoes}
                onChange={(e) => salvarAnotacao(e.target.value)}
                className="w-full p-3.5 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
              />
            </div>

            {/* 3. Links e Vídeos (com Exclusão) */}
            <div className="bg-slate-800 p-4 md:p-5 rounded-lg border border-slate-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
                <span>🔗</span> Links & Vídeos Úteis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Título (Ex: Canal de Aulas / Vídeo)"
                  value={tituloLink}
                  onChange={(e) => setTituloLink(e.target.value)}
                  className="px-3 py-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  className="px-3 py-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none"
                />
              </div>

              <button
                onClick={adicionarLink}
                className="bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-bold text-sm sm:w-auto sm:self-start sm:px-6 transition-colors"
              >
                Anexar Link
              </button>

              <div className="flex flex-col gap-2 mt-1">
                {selecionada.links.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-700/60 rounded border border-slate-600 flex items-center justify-between text-sm"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-300 hover:text-indigo-200 underline truncate pr-2"
                    >
                      📌 {item.titulo}
                    </a>
                    <button
                      onClick={() => excluirLink(item.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 shrink-0"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Carregar Fotos e Arquivos do Dispositivo */}
            <div className="bg-slate-800 p-4 md:p-5 rounded-lg border border-slate-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
                <span>📁</span> Arquivos, Fotos e PDFs do Celular/PC
              </h3>

              <label className="cursor-pointer bg-slate-700 hover:bg-slate-650 border border-dashed border-slate-500 p-4 rounded-lg text-center transition-colors">
                <span className="text-sm text-slate-300 font-medium">
                  📸 Clique para pesquisar/carregar fotos ou arquivos do seu aparelho
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleUploadArquivo}
                  className="hidden"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {selecionada.arquivos.map((arq) => (
                  <div
                    key={arq.id}
                    className="bg-slate-700/60 p-3 rounded border border-slate-600 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="truncate pr-2 text-slate-200">📄 {arq.nome}</span>
                      <button
                        onClick={() => excluirArquivo(arq.id)}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Excluir
                      </button>
                    </div>

                    {/* Exibe prévia se for imagem */}
                    {arq.tipo.startsWith('image/') ? (
                      <img
                        src={arq.dadosBase64}
                        alt={arq.nome}
                        className="w-full h-32 object-cover rounded border border-slate-600"
                      />
                    ) : (
                      <a
                        href={arq.dadosBase64}
                        download={arq.nome}
                        className="text-xs text-indigo-300 underline mt-1"
                      >
                        Baixar arquivo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 gap-3">
            <span className="text-5xl">📖</span>
            <p className="text-center">Crie ou selecione uma matéria no menu para gerenciar seus estudos.</p>
          </div>
        )}
      </main>
    </div>
  );
}
