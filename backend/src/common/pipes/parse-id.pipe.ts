import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(valor: string): string {
    if (!isValidObjectId(valor)) {
      throw new BadRequestException('El identificador no es válido');
    }
    return valor;
  }
}
