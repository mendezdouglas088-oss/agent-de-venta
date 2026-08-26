import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { FileType } from '../commons/interfaces/file-type.interface';

('photos/file_0.jpg');

@Injectable()
export class TelegramBotService {
  async downloadImage(file: FileType) {
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    const fileName = file.file_path.split('/').pop();

    const buffer = Buffer.from(response.data);

    return { buffer, fileName };
  }
}
