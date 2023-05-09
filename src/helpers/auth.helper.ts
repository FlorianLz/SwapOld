const authHelper = {
  /**
   * Vérifie si une adresse e-mail est valide.
   * @param {string} email - L'adresse e-mail à vérifier.
   * @returns {boolean} - True si l'adresse e-mail est valide, false sinon.
   */
  checkEmailIsValid: (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  },

  /**
   * Vérifie si un mot de passe est valide.
   * @param {string} password - Le mot de passe à vérifier.
   * @returns {boolean} - True si le mot de passe est valide, false sinon.
   */
  checkPasswordIsValid: (password: string) => {
    let reg = new RegExp(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    );
    return reg.test(password);
  },
};
export default authHelper;
