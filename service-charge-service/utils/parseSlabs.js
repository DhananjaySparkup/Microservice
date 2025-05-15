module.exports = function parseSlabs(slabStr, amount) {
    const slabs = slabStr.split('/');
  
    for (let slab of slabs) {
      const [min, max, charge, unit] = slab.split('_');
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      const rate = parseFloat(charge);
  
      if (amount >= minVal && amount <= maxVal) {
        return unit.includes('%') ? (amount * rate) / 100 : rate;
      }
    }
  
    return null;
  };  
