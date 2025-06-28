// src/components/LeadsDashboard.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importa o cliente que criamos

// Componente de formatação de data (pode ficar no mesmo arquivo ou separado)
const formatarData = (isoString: string | undefined) => {
    if (!isoString) return 'N/A';
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


// Defina o tipo Lead para corresponder à estrutura dos dados do Supabase
type Lead = {
    id: number;
    created_at?: string;
    name?: string;
    phone?: string;
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
};

function LeadsDashboard() {
    // ---- ESTADO (State) ----
    // 'leads' vai armazenar a lista de dados vinda do Supabase
    // 'loading' vai nos ajudar a mostrar uma mensagem de "carregando"
    // 'error' vai guardar qualquer erro que aconteça na busca
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ---- BUSCA DE DADOS (Effect) ----
    // useEffect com um array de dependências vazio `[]` executa apenas uma vez,
    // quando o componente é montado. Perfeito para buscar dados iniciais.
    useEffect(() => {
        async function getLeads() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setLeads(data); // Guarda os dados no nosso estado
            } catch (error) {
                setError(error instanceof Error ? error.message : String(error)); // Guarda a mensagem de erro no estado
            } finally {
                setLoading(false); // Para de carregar, independentemente de sucesso ou erro
            }
        }

        getLeads(); // Chama a função que busca os dados
    }, []); // O array vazio garante que isso rode só uma vez

    // ---- RENDERIZAÇÃO ----
    
    // Se estiver carregando, mostra uma mensagem
    if (loading) {
        return <div>Carregando leads...</div>;
    }

    // Se deu erro, mostra o erro
    if (error) {
        return <div>Erro: {error}</div>;
    }

    // Se tudo deu certo, renderiza a sua interface
    return (
        <div className="seu-container-principal">
            {/* Você pode adaptar seus cards de KPI aqui */}
            <div className="card-kpi">
                <h2>Total de Leads</h2>
                <p>{leads.length}</p>
            </div>

            {/* Adapte a sua tabela aqui */}
            <div className="tabela-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Origem (UTM)</th>
                            <th>Campanha (UTM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            // `key` é muito importante para o React saber qual item é qual
                            <tr key={lead.id}>
                                <td>{formatarData(lead.created_at)}</td>
                                <td>{lead.name || 'N/A'}</td>
                                <td>{lead.phone || 'N/A'}</td>
                                <td>{lead.utm_source || 'N/A'}</td>
                                <td>{lead.utm_campaign || 'N/A'}</td>
                                <td>{lead.utm_medium || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LeadsDashboard;