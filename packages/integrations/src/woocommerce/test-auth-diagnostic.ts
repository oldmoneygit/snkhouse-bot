import { config } from "dotenv";
import { resolve } from "path";
import axios, { AxiosError } from "axios";

// Carregar .env.local da raiz do projeto
config({ path: resolve(process.cwd(), "../../.env.local") });

interface DiagnosticResult {
  test: string;
  success: boolean;
  status?: number;
  message: string;
  details?: any;
  suggestion?: string;
}

class WooCommerceDiagnostic {
  private url: string;
  private consumerKey: string;
  private consumerSecret: string;
  private results: DiagnosticResult[] = [];

  constructor() {
    this.url = process.env.WOOCOMMERCE_URL || "https://snkhouse.com";
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

    console.log("🔍 DIAGNÓSTICO WOOCOMMERCE API - SNKHOUSE");
    console.log("━".repeat(80));
    console.log(`📍 URL: ${this.url}`);
    console.log(`🔑 Consumer Key: ${this.consumerKey.substring(0, 15)}...`);
    console.log(
      `🔐 Consumer Secret: ${this.consumerSecret.substring(0, 15)}...`,
    );
    console.log("━".repeat(80));
  }

  private addResult(
    test: string,
    success: boolean,
    message: string,
    status?: number,
    details?: any,
    suggestion?: string,
  ) {
    this.results.push({ test, success, status, message, details, suggestion });

    const icon = success ? "✅" : "❌";
    const statusText = status ? ` (${status})` : "";
    console.log(`${icon} ${test}${statusText}: ${message}`);

    if (details && !success) {
      console.log(`   📋 Detalhes:`, details);
    }

    if (suggestion && !success) {
      console.log(`   💡 Sugestão: ${suggestion}`);
    }
  }

  async testBasicConnectivity(): Promise<boolean> {
    console.log("\n🌐 TESTE 1: CONECTIVIDADE BÁSICA");
    console.log("─".repeat(50));

    try {
      // Teste 1.1: Verificar se o site está online
      const response = await axios.get(this.url, { timeout: 10000 });
      this.addResult(
        "Site Online",
        true,
        "Site respondendo normalmente",
        response.status,
      );
    } catch (error: any) {
      this.addResult(
        "Site Online",
        false,
        error.response?.status,
        "Site não está respondendo ou timeout",
        error.message,
        "Verifique se o site está online e acessível",
      );
      return false;
    }

    try {
      // Teste 1.2: Verificar se WordPress está ativo
      const wpJsonUrl = `${this.url}/wp-json/`;
      const response = await axios.get(wpJsonUrl, { timeout: 10000 });
      this.addResult(
        "WordPress REST API",
        true,
        response.status,
        "WordPress REST API ativa",
      );
    } catch (error: any) {
      this.addResult(
        "WordPress REST API",
        false,
        error.response?.status,
        "WordPress REST API não está ativa ou acessível",
        error.message,
        "Verifique se o WordPress está instalado e funcionando",
      );
      return false;
    }

    return true;
  }

  async testWooCommerceAPI(): Promise<boolean> {
    console.log("\n🛒 TESTE 2: WOOCOMMERCE API");
    console.log("─".repeat(50));

    try {
      // Teste 2.1: Verificar se WooCommerce API está disponível
      const wcApiUrl = `${this.url}/wp-json/wc/v3/`;
      const response = await axios.get(wcApiUrl, { timeout: 10000 });
      this.addResult(
        "WooCommerce API Endpoint",
        true,
        response.status,
        "API endpoint acessível",
      );

      if (response.data?.namespace) {
        console.log(`   📋 Namespace: ${response.data.namespace}`);
        console.log(
          `   📋 Routes disponíveis: ${Object.keys(response.data.routes || {}).length}`,
        );
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        this.addResult(
          "WooCommerce API Endpoint",
          false,
          status,
          "WooCommerce não está instalado ou API não está ativa",
          error.response?.data,
          "Instale o plugin WooCommerce e ative a API REST",
        );
      } else {
        this.addResult(
          "WooCommerce API Endpoint",
          false,
          status,
          "Erro ao acessar API WooCommerce",
          error.message,
          "Verifique se WooCommerce está funcionando corretamente",
        );
      }
      return false;
    }

    return true;
  }

  async testAuthenticationMethods(): Promise<boolean> {
    console.log("\n🔐 TESTE 3: MÉTODOS DE AUTENTICAÇÃO");
    console.log("─".repeat(50));

    const testUrl = `${this.url}/wp-json/wc/v3/system_status`;
    let anyMethodWorked = false;

    // Método 1: Basic Auth (atual)
    try {
      console.log("   🔍 Testando Basic Auth...");
      const response = await axios.get(testUrl, {
        auth: {
          username: this.consumerKey,
          password: this.consumerSecret,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      this.addResult(
        "Basic Auth",
        true,
        response.status,
        "Autenticação básica funcionando",
      );
      anyMethodWorked = true;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401) {
        this.addResult(
          "Basic Auth",
          false,
          status,
          "Credenciais inválidas ou sem permissão",
          error.response?.data,
          "Verifique se as credenciais estão corretas e têm permissão de leitura",
        );
      } else {
        this.addResult(
          "Basic Auth",
          false,
          status,
          "Erro na autenticação básica",
          error.response?.data,
        );
      }
    }

    // Método 2: Query Parameters
    try {
      console.log("   🔍 Testando Query Parameters...");
      const response = await axios.get(testUrl, {
        params: {
          consumer_key: this.consumerKey,
          consumer_secret: this.consumerSecret,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      this.addResult(
        "Query Parameters",
        true,
        response.status,
        "Autenticação por query params funcionando",
      );
      anyMethodWorked = true;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401) {
        this.addResult(
          "Query Parameters",
          false,
          status,
          "Credenciais inválidas mesmo com query params",
          error.response?.data,
          "As credenciais podem estar incorretas ou expiradas",
        );
      } else {
        this.addResult(
          "Query Parameters",
          false,
          status,
          "Erro na autenticação por query params",
          error.response?.data,
        );
      }
    }

    // Método 3: Headers Customizados
    try {
      console.log("   🔍 Testando Headers Customizados...");
      const response = await axios.get(testUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-WC-API-Key": this.consumerKey,
          "X-WC-API-Secret": this.consumerSecret,
        },
        timeout: 15000,
      });

      this.addResult(
        "Headers Customizados",
        true,
        response.status,
        "Autenticação por headers funcionando",
      );
      anyMethodWorked = true;
    } catch (error: any) {
      this.addResult(
        "Headers Customizados",
        false,
        error.response?.status,
        "Autenticação por headers não suportada",
        error.response?.data,
      );
    }

    return anyMethodWorked;
  }

  async testAPIEndpoints(): Promise<boolean> {
    console.log("\n📋 TESTE 4: ENDPOINTS DA API");
    console.log("─".repeat(50));

    const endpoints = [
      { name: "System Status", url: "/system_status", method: "GET" },
      { name: "Products (Lista)", url: "/products?per_page=1", method: "GET" },
      {
        name: "Categories (Lista)",
        url: "/products/categories?per_page=1",
        method: "GET",
      },
    ];

    let workingEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(
          `${this.url}/wp-json/wc/v3${endpoint.url}`,
          {
            auth: {
              username: this.consumerKey,
              password: this.consumerSecret,
            },
            timeout: 15000,
          },
        );

        this.addResult(
          `Endpoint: ${endpoint.name}`,
          true,
          response.status,
          "Endpoint acessível",
        );
        workingEndpoints++;

        // Log de dados úteis
        if (endpoint.name === "Products (Lista)" && response.data.length > 0) {
          console.log(`   📦 Exemplo produto: ${response.data[0].name}`);
        }
        if (
          endpoint.name === "Categories (Lista)" &&
          response.data.length > 0
        ) {
          console.log(`   📂 Exemplo categoria: ${response.data[0].name}`);
        }
      } catch (error: any) {
        const status = error.response?.status;
        let suggestion = "";

        if (status === 401) {
          suggestion = "Verifique permissões das credenciais";
        } else if (status === 403) {
          suggestion = "Credenciais não têm permissão para este endpoint";
        } else if (status === 404) {
          suggestion = "Endpoint não encontrado ou WooCommerce não instalado";
        }

        this.addResult(
          `Endpoint: ${endpoint.name}`,
          false,
          status,
          "Endpoint não acessível",
          error.response?.data,
          suggestion,
        );
      }
    }

    return workingEndpoints > 0;
  }

  async testCredentialsValidation(): Promise<boolean> {
    console.log("\n🔑 TESTE 5: VALIDAÇÃO DE CREDENCIAIS");
    console.log("─".repeat(50));

    // Verificar formato das credenciais
    const keyPattern = /^ck_[a-f0-9]{40}$/;
    const secretPattern = /^cs_[a-f0-9]{40}$/;

    const keyValid = keyPattern.test(this.consumerKey);
    const secretValid = secretPattern.test(this.consumerSecret);

    this.addResult(
      "Formato Consumer Key",
      keyValid,
      undefined,
      keyValid ? "Formato correto" : "Formato incorreto",
      { key: this.consumerKey.substring(0, 10) + "..." },
      keyValid
        ? undefined
        : 'Consumer Key deve começar com "ck_" e ter 43 caracteres',
    );

    this.addResult(
      "Formato Consumer Secret",
      secretValid,
      undefined,
      secretValid ? "Formato correto" : "Formato incorreto",
      { secret: this.consumerSecret.substring(0, 10) + "..." },
      secretValid
        ? undefined
        : 'Consumer Secret deve começar com "cs_" e ter 43 caracteres',
    );

    return keyValid && secretValid;
  }

  async testServerConfiguration(): Promise<void> {
    console.log("\n⚙️ TESTE 6: CONFIGURAÇÃO DO SERVIDOR");
    console.log("─".repeat(50));

    try {
      // Teste HTTPS
      const isHttps = this.url.startsWith("https://");
      this.addResult(
        "HTTPS",
        isHttps,
        undefined,
        isHttps ? "Usando HTTPS (recomendado)" : "Usando HTTP",
        undefined,
        isHttps ? undefined : "Recomenda-se usar HTTPS para produção",
      );

      // Teste CORS (se aplicável)
      try {
        const response = await axios.options(`${this.url}/wp-json/wc/v3/`, {
          timeout: 5000,
        });
        this.addResult(
          "CORS Headers",
          true,
          response.status,
          "CORS configurado",
        );
      } catch (error: any) {
        this.addResult(
          "CORS Headers",
          false,
          undefined,
          "CORS não configurado ou bloqueado",
        );
      }
    } catch (error: any) {
      console.log("   ⚠️ Não foi possível testar configurações do servidor");
    }
  }

  generateReport(): void {
    console.log("\n" + "━".repeat(80));
    console.log("📊 RELATÓRIO FINAL");
    console.log("━".repeat(80));

    const totalTests = this.results.length;
    const successfulTests = this.results.filter((r) => r.success).length;
    const failedTests = totalTests - successfulTests;

    console.log(`📈 Total de testes: ${totalTests}`);
    console.log(`✅ Sucessos: ${successfulTests}`);
    console.log(`❌ Falhas: ${failedTests}`);
    console.log(
      `📊 Taxa de sucesso: ${((successfulTests / totalTests) * 100).toFixed(1)}%`,
    );

    if (failedTests > 0) {
      console.log("\n🔧 AÇÕES RECOMENDADAS:");
      console.log("─".repeat(50));

      const failedResults = this.results.filter((r) => !r.success);
      failedResults.forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.test}: ${result.suggestion || "Investigar problema"}`,
        );
      });

      console.log("\n💡 PRÓXIMOS PASSOS:");
      console.log("─".repeat(50));

      const authFailed = failedResults.some(
        (r) => r.test.includes("Auth") || r.test.includes("Credential"),
      );
      const apiFailed = failedResults.some(
        (r) => r.test.includes("API") || r.test.includes("Endpoint"),
      );
      const connectivityFailed = failedResults.some(
        (r) => r.test.includes("Online") || r.test.includes("WordPress"),
      );

      if (connectivityFailed) {
        console.log("1. 🔗 Resolver problemas de conectividade básica");
        console.log("   - Verificar se o site está online");
        console.log("   - Verificar se WordPress está funcionando");
      }

      if (apiFailed) {
        console.log("2. 🛒 Configurar WooCommerce API");
        console.log("   - Instalar/ativar plugin WooCommerce");
        console.log(
          "   - Habilitar API REST em WooCommerce > Configurações > Avançado",
        );
      }

      if (authFailed) {
        console.log("3. 🔑 Recriar credenciais WooCommerce");
        console.log(
          "   - Acessar: WooCommerce > Configurações > Avançado > API REST",
        );
        console.log("   - Deletar chaves antigas");
        console.log('   - Criar novas com permissão "Leitura/Gravação"');
        console.log("   - Atualizar .env.local com novas credenciais");
      }
    } else {
      console.log("\n🎉 TODOS OS TESTES PASSARAM!");
      console.log("✅ A API WooCommerce está funcionando corretamente");
      console.log("✅ As credenciais estão válidas");
      console.log("✅ A conectividade está OK");
    }

    console.log("\n" + "━".repeat(80));
  }

  async runFullDiagnostic(): Promise<void> {
    try {
      // Executar todos os testes
      const connectivityOk = await this.testBasicConnectivity();
      if (!connectivityOk) {
        console.log(
          "\n⚠️ Problemas de conectividade detectados. Continuando com testes limitados...",
        );
      }

      const apiOk = await this.testWooCommerceAPI();
      if (!apiOk) {
        console.log(
          "\n⚠️ WooCommerce API não disponível. Pulando testes de autenticação...",
        );
        this.generateReport();
        return;
      }

      const authOk = await this.testAuthenticationMethods();
      if (!authOk) {
        console.log(
          "\n⚠️ Problemas de autenticação detectados. Continuando com testes limitados...",
        );
      }

      await this.testAPIEndpoints();
      await this.testCredentialsValidation();
      await this.testServerConfiguration();

      this.generateReport();
    } catch (error: any) {
      console.error("\n💥 ERRO CRÍTICO NO DIAGNÓSTICO:", error.message);
      this.generateReport();
    }
  }
}

// Executar diagnóstico
async function main() {
  const diagnostic = new WooCommerceDiagnostic();
  await diagnostic.runFullDiagnostic();
}

main().catch(console.error);
