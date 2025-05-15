exports.applyTopUpRules = (wallet, amount) => {
    const result = { ...wallet._doc };
  
    if (wallet.lean > 0) {
      if (amount >= wallet.lean) {
        amount -= wallet.lean;
        result.lean = 0;
        result.balance += amount;
      } else {
        result.lean -= amount;
      }
    } else {
      result.balance += amount;
    }
  
    return result;
  };  
