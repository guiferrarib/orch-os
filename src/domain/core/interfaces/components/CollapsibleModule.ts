/**
 * Orch-OS Neural-Symbolic Interface Specification
 * 
 * CollapsibleModule - Interface para módulos de UI colapsáveis/expansíveis.
 * Intenção simbólica: Representa um córtex neuralmente adaptável que pode
 * expandir ou colapsar para otimizar a densidade cognitiva da interface.
 */

import { ReactNode } from 'react';

export interface CollapsibleModuleProps {
  /** Título do módulo cortical */
  title: string;
  
  /** Define se o módulo inicia em estado expandido */
  defaultOpen?: boolean;
  
  /** Conteúdo neural do módulo */
  children: ReactNode;
  
  /** Usado apenas para debugging visual - não para produção */
  debugBorder?: boolean;
}

export interface CollapsibleModuleState {
  /** Estado atual (expandido/colapsado) */
  isExpanded: boolean;
  
  /** Função para alternar entre estados */
  toggle: () => void;
}
