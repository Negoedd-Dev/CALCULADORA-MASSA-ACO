import { useState, useMemo } from "react";
import "./CalculadoraMassa.css";
import { calcular, DENSIDADE_ACO } from "../../components/calculos/calculos";

const fmt = (valor, casas = 2) =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export default function CalculadoraMassa() {
  const [unidade, setUnidade] = useState("mm");
  const [od, setOd] = useState("");
  const [parede, setParede] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [recorte, setRecorte] = useState("");
  const [densidade, setDensidade] = useState(String(DENSIDADE_ACO).replace(".", ","));
  const [copiado, setCopiado] = useState(false);

  const { resultado, erro } = useMemo(
    () => calcular({ od, parede, unidade, comprimento, recorte, densidade }),
    [od, parede, unidade, comprimento, recorte, densidade]
  );

  function limpar() {
    setOd("");
    setParede("");
    setComprimento("");
    setRecorte("");
    setDensidade(String(DENSIDADE_ACO).replace(".", ","));
  }

  async function copiar() {
    if (!resultado) return;
    const linhas = [
      `Tubo sem costura: ${fmt(resultado.odMm)} mm x ${fmt(resultado.paredeMm)} mm`,
      `Massa por metro: ${fmt(resultado.kgPorMetro)} kg/m (${fmt(resultado.lbPorPe)} lb/ft)`,
    ];
    if (resultado.massaPeca !== undefined) {
      linhas.push(`Peça de ${fmt(resultado.comprimento, 3)} m: ${fmt(resultado.massaPeca)} kg`);
    }
    if (resultado.recorte !== undefined) {
      linhas.push(
        `Recorte de ${fmt(resultado.recorte, 3)} m: remove ${fmt(resultado.massaRemovida)} kg; ` +
          `sobra ${fmt(resultado.comprimentoRestante, 3)} m (${fmt(resultado.massaRestante)} kg)`
      );
    }
    try {
      await navigator.clipboard.writeText(linhas.join("\n"));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sem permissão de copiar: o usuário ainda vê o resultado na tela */
    }
  }

  return (
    <section className="calc" aria-label="Calculadora de massa de tubo de aço sem costura">
      <h2>Massa de tubo de aço sem costura</h2>

      <div className="calc-grade">
        <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="calc-unidade">
            <legend>Unidade do diâmetro e da parede</legend>
            {["mm", "pol"].map((u) => (
              <label key={u}>
                <input
                  type="radio"
                  name="unidade"
                  checked={unidade === u}
                  onChange={() => setUnidade(u)}
                />
                {u === "mm" ? "mm" : "polegadas"}
              </label>
            ))}
          </fieldset>

          <label>
            Diâmetro externo ({unidade})
            <input inputMode="decimal" value={od} onChange={(e) => setOd(e.target.value)} />
          </label>
          <label>
            Espessura da parede ({unidade})
            <input
              inputMode="decimal"
              value={parede}
              onChange={(e) => setParede(e.target.value)}
            />
          </label>
          <label>
            Comprimento da peça (m) <span className="calc-opcional">opcional</span>
            <input
              inputMode="decimal"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
            />
          </label>
          <label>
            Recorte a remover (m) <span className="calc-opcional">opcional</span>
            <input
              inputMode="decimal"
              value={recorte}
              onChange={(e) => setRecorte(e.target.value)}
            />
          </label>
          <label>
            Densidade (g/cm³)
            <input
              inputMode="decimal"
              value={densidade}
              onChange={(e) => setDensidade(e.target.value)}
            />
          </label>

          <button type="button" className="calc-limpar" onClick={limpar}>
            Limpar
          </button>
        </form>

        <div className="calc-saida" aria-live="polite">
          {erro && <p className="calc-erro">{erro}</p>}

          {!erro && !resultado && (
            <p className="calc-vazio">Informe o diâmetro externo e a parede para calcular.</p>
          )}

          {!erro && resultado && (
            <>
              <dl className="calc-resultados">
                <div>
                  <dt>Massa por metro</dt>
                  <dd>
                    <strong>{fmt(resultado.kgPorMetro)}</strong> kg/m
                    <small>{fmt(resultado.lbPorPe)} lb/ft</small>
                  </dd>
                </div>
                <div>
                  <dt>Diâmetro interno</dt>
                  <dd>
                    <strong>{fmt(resultado.diametroInternoMm)}</strong> mm
                  </dd>
                </div>
                {resultado.massaPeca !== undefined && (
                  <div>
                    <dt>Massa da peça ({fmt(resultado.comprimento, 3)} m)</dt>
                    <dd>
                      <strong>{fmt(resultado.massaPeca)}</strong> kg
                    </dd>
                  </div>
                )}
                {resultado.recorte !== undefined && (
                  <>
                    <div>
                      <dt>Massa removida ({fmt(resultado.recorte, 3)} m)</dt>
                      <dd>
                        <strong>{fmt(resultado.massaRemovida)}</strong> kg
                      </dd>
                    </div>
                    <div>
                      <dt>Peça após o recorte</dt>
                      <dd>
                        <strong>{fmt(resultado.comprimentoRestante, 3)}</strong> m
                        <small>{fmt(resultado.massaRestante)} kg</small>
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              <button type="button" className="calc-copiar" onClick={copiar}>
                {copiado ? "Copiado!" : "Copiar resumo"}
              </button>
            </>
          )}

          <p className="calc-aviso">
            Massa teórica de tubo liso (sem luva), sem considerar tolerâncias de diâmetro, parede
            e peso. Para fins de conferência, siga a norma e o procedimento aplicáveis.
          </p>
        </div>
      </div>
    </section>
  );
}