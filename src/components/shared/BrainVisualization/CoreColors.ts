/**
 * Core color mappings for brain visualization
 * Each cognitive core type has a consistent color across all visualizations
 */

// Define colors for each core type
export const coreColors: Record<string, string> = {
  memory:        "#1E90FF",
  valence:       "#FFD700",
  metacognitive: "#00CED1",
  associative:   "#A0522D",
  language:      "#32CD32",
  planning:      "#FF8C00",
  unconscious:   "#222222",
  archetype:     "#E066FF",
  soul:          "#FFFFFF",
  shadow:        "#8A2BE2",
  body:          "#FF6347",
  social:        "#00BFFF",
  self:          "#FF69B4",
  creativity:    "#FF4500",
  intuition:     "#7FFFD4",
  will:          "#BDB76B",
  default:       "#3B82F6", // Default blue fallback
};

/**
 * Get the color for a specific core type
 * @param core The name of the core (e.g., 'memory', 'valence')
 * @returns The hexadecimal color code for that core
 */
export function getCoreColor(core: string): string {
  return coreColors[core] || coreColors.default;
}
