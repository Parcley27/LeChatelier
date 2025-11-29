# Le Chatelier's Equilibrium Landscape

An interactive 3D visualization of Le Chatelier's Principle using dynamic terrain to represent equilibrium shifts in real time.

## What This Is

This website visualizes six equilibrium systems from the Le Chatelier's Rainbow lab: bromothymol blue, iron thiocyanate, copper ammine complexes, copper aqua-chloro, cobalt aqua-chloro, and CO₂ in water. Instead of static diagrams, equilibrium becomes a living landscape that responds to stresses.

## How It Works

### The Visual Model

The landscape uses two peaks to represent equilibrium:
- **Left peak**: reactant concentration
- **Right peak**: product concentration
- **Height**: relative concentration of each species
- **Colour**: blends from reactant colour → product colour based on equilibrium position
- **Timeline**: flows from back (past) to front (present)

When equilibrium shifts, you see the peaks change height and the colour gradient move across the terrain. The temporal dimension shows how disturbances propagate through time—stresses applied in the past create waves that flow forward until the system reaches a new equilibrium.

### Controls

**System selector**: Choose from six lab equilibrium systems, each with colours matching the actual solutions.

**Stress buttons**:
- Add reactant/product - shifts equilibrium away from the added species
- Heat/cool - shifts based on reaction thermodynamics (endothermic vs exothermic)
- Reduce concentration - demonstrates dilution effects

**Manual slider**: Explore any equilibrium position between pure reactants and pure products.

### Technical Implementation

Built with Three.js, the visualization renders a 3D plane using Gaussian functions to create the dual peaks. Each peak's height is calculated from the equilibrium position and total concentration, where each peak uses bell curve equations weighted by whether the system favors reactants or products at that moment. A circular buffer stores 2100 frames of equilibrium history, letting the y-axis represent time. As new equilibrium states are calculated, they push into the front of the landscape while old states recede into the distance.

Colour interpolation mixes the reactant and product colours based on both spatial position and the historical equilibrium state at each point, creating smooth colour transitions that represent the actual visible changes you'd observe in the lab.

## The Chemistry

### Le Chatelier's Principle

When a system at equilibrium experiences a stress, it shifts to counteract that stress. At equilibrium, forward and reverse reaction rates are equal. Adding reactant increases the concentration of collision partners for the forward reaction, temporarily increasing its rate. The system responds by consuming excess reactant until rates balance again at a new equilibrium position.

### Why This Visualization Works

Equilibrium is dynamic, not static. Reactions continue in both directions at equal rates, which the dual-peak landscape captures perfectly. The relative peak heights show which direction is favored, while the smooth transition represents continuous molecular interconversion.

The temporal dimension is crucial because equilibrium shifts aren't instantaneous. When you stress a system, there's immediate disruption followed by gradual re-equilibration. The landscape shows this as a disturbance moving through time.

### Connecting to Lab Systems

Each system has distinct colours from the lab. For example:
- **Iron thiocyanate**: Fe³⁺ (pale yellow) ⇌ FeSCN²⁺ (deep red)
- **Bromothymol blue**: HIn (yellow) ⇌ H⁺ + In⁻ (blue)  
- **Cobalt aqua-chloro**: [Co(H₂O)₆]²⁺ (pink) ⇌ [CoCl₄]²⁻ (blue)

The colour shifts you observed in the lab when adding reagents are recreated here. Adding Cl⁻ to cobalt shifts toward blue [CoCl₄]²⁻, and the landscape becomes increasingly blue as the product peak grows.

Temperature effects follow thermodynamics. For endothermic reactions, heat acts like a reactant—adding heat shifts toward products. For exothermic reactions, heat is like a product—adding heat shifts toward reactants. The cobalt system is endothermic in the forward direction, so heating intensifies the blue colour, matching lab observations.

### Beyond Simple Shifts

The visualization shows that adding reactant doesn't just shift the equilibrium—it also increases total concentration. Both peaks initially rise when you add material, then the system redistributes toward products. This matches the molecular reality: you've added particles that participate in collisions, temporarily increasing both concentrations before equilibrium re-establishes.

## Viewing the project
The site will be up on [https://lechat.airtraffic.online](https://lechat.airtraffic.online) for as long as I don't have my personal website published.
