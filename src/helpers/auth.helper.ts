const authHelper = {
  checkEmailIsValid: (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  },
  checkPasswordIsValid: (password: string) => {
    let reg = new RegExp(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    );
    return reg.test(password);
  },
};
export default authHelper;
