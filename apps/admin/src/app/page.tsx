import styles from "./page.module.css";

const metrics = [
  {
    label: "Conversas ativas",
    value: "12",
    trend: "+3 vs. última hora",
  },
  {
    label: "Taxa de satisfação",
    value: "97%",
    trend: "↑ 2% esta semana",
  },
  {
    label: "Pedidos gerados",
    value: "28",
    trend: "+9 hoje",
  },
];

const shortcuts = [
  { label: "Fila de atendimentos", description: "Monitore clientes aguardando resposta" },
  { label: "Base de conhecimento", description: "Atualize respostas frequentes" },
  { label: "Integrações", description: "Gerencie WhatsApp, Shopify e outros canais" },
];

const sessions = [
  { name: "Larissa Costa", status: "Consultando status do pedido" },
  { name: "João Mendes", status: "Escolhendo produtos recomendados" },
  { name: "Marta Silva", status: "Negociando condições de frete" },
];

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <p className={styles.headerSubtitle}>SNK House Bot</p>
            <h1 className={styles.headerTitle}>Painel Administrativo</h1>
          </div>
          <div className={styles.headerSync}>
            <p>Última sincronização</p>
            <p>há 2 minutos</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section>
          <h2 className={styles.sectionTitle}>Visão geral</h2>
          <div className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.metricCard}>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricValue}>{metric.value}</p>
                <p className={styles.metricTrend}>{metric.trend}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>Atendimentos recentes</h2>
            <p className={styles.panelDescription}>
              Veja quem está sendo atendido pelo assistente e intervenha quando necessário.
            </p>
            <ul className={styles.sessionList}>
              {sessions.map((session) => (
                <li key={session.name} className={styles.sessionItem}>
                  <div>
                    <p className={styles.sessionName}>{session.name}</p>
                    <p className={styles.sessionStatus}>{session.status}</p>
                  </div>
                  <button type="button" className={styles.sessionButton}>
                    Assumir
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>Acessos rápidos</h2>
            <ul className={styles.shortcuts}>
              {shortcuts.map((shortcut) => (
                <li key={shortcut.label} className={styles.shortcutItem}>
                  <p className={styles.shortcutTitle}>{shortcut.label}</p>
                  <p className={styles.shortcutDescription}>{shortcut.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        SNK House © {new Date().getFullYear()} • Dashboard em desenvolvimento
      </footer>
    </div>
  );
}
