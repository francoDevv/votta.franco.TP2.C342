import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordSegura: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  if (!valor) return null;

  const errores: ValidationErrors = {};
  if (valor.length < 8) errores['minimo8'] = true;
  if (!/[A-Z]/.test(valor)) errores['mayuscula'] = true;
  if (!/\d/.test(valor)) errores['numero'] = true;
  return Object.keys(errores).length ? errores : null;
};

export function coinciden(campo: string, repetido: string): ValidatorFn {
  return (grupo: AbstractControl) => {
    const valor = grupo.get(campo)?.value;
    const otro = grupo.get(repetido)?.value;
    return valor && otro && valor !== otro ? { noCoinciden: true } : null;
  };
}

export function edadMinima(anios: number): ValidatorFn {
  return (control) => {
    if (!control.value) return null;
    const fecha = new Date(control.value);
    if (fecha > new Date()) return { fechaFutura: true };

    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - anios);
    return fecha > limite ? { edadMinima: { anios } } : null;
  };
}
