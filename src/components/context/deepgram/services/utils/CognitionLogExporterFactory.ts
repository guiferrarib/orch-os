// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// Factory for cognitive log exporters
import { CognitionLogExporter } from './CognitionLogExporter';
import { CognitionLogJsonExporter } from './CognitionLogJsonExporter';
import { CognitionLogTxtExporter } from './CognitionLogTxtExporter';

/**
 * Factory responsible for creating and providing cognitive log exporters
 * Following the Factory Method pattern of SOLID
 */
export class CognitionLogExporterFactory {
  private static instance: CognitionLogExporterFactory;
  private exporters: CognitionLogExporter[] = [];

  private constructor() {
    // Initializes default exporters
    this.registerDefaultExporters();
  }

  /**
   * Gets the unique instance of the factory (Singleton)
   */
  public static getInstance(): CognitionLogExporterFactory {
    if (!CognitionLogExporterFactory.instance) {
      CognitionLogExporterFactory.instance = new CognitionLogExporterFactory();
    }
    return CognitionLogExporterFactory.instance;
  }

  /**
   * Registers default exporters of the system
   */
  private registerDefaultExporters(): void {
    this.exporters = [
      new CognitionLogJsonExporter(),
      new CognitionLogTxtExporter()
    ];
  }

  /**
   * Adds a new exporter to the list
   * @param exporter Exporter to be added
   */
  public registerExporter(exporter: CognitionLogExporter): void {
    this.exporters.push(exporter);
  }

  /**
   * Removes an exporter based on the label
   * @param label Label of the exporter to be removed
   */
  public unregisterExporter(label: string): void {
    this.exporters = this.exporters.filter(e => e.label !== label);
  }

  /**
   * Gets all registered exporters
   */
  public getExporters(): CognitionLogExporter[] {
    return [...this.exporters];
  }
}

// Export a singleton instance of the factory for global use
export default CognitionLogExporterFactory.getInstance();
