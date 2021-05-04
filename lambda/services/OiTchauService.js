const axios = require('axios');
const { msToTime, formatDate, addZeroLeft } = require('../utils/TimeUtils');

class OiTchauService {
  constructor(credentials, timeZone = 0) {
    this.credentials = credentials
    this.timeZone = timeZone;
    this.token = '';
    this.employee_id = '';
  }

  async login() {
    console.log('[🤖] Realizando login!');
    const res = await axios.post(
      'https://admin-api.oitchau.com.br/api/sessions',
      this.credentials
    );
    this.token = res.data.authentication_token;
    this.employee_id = res.data.selected_user_profile_id;
    console.log('[🤖] Login com sucesso!');
  }

  async getLastRegisters() {
    const today = new Date();
    const speakOuts = [];
    console.log('[🤖] Recuperando seu último ponto...');
    const res = await this.getRegisters();
    let automaticCount = 0;
    let enterTime, exitTime;
    console.log('[🤖] Seus últimos dois pontos foram:');
    for (let i = 0; i < 2; i++) {
      while (res.punches[i + automaticCount].source === 'automatic_break') {
        automaticCount++;
      }
      const lastRegister = new Date(
        res.punches[i + automaticCount].device_datetime
      );
      const type =
        res.punches[i + automaticCount].punch_type === 'exit'
          ? 'Saída'
          : res.punches[i + automaticCount].punch_type === 'entry'
          ? 'Entrada'
          : 'Desconhecido';
      if(i===0){
         exitTime = lastRegister
      } else if(exitTime.getDate() !== lastRegister.getDate()){
          return speakOuts;
      } else {
          enterTime = lastRegister
      }
      speakOuts.push(
        `Ponto do tipo ${type}, ${today.getDate() === lastRegister.getDate() ? "hoje" : `no dia ${lastRegister.getDate()}`}, às ${lastRegister.getHours() - this.timeZone} horas e ${lastRegister.getMinutes()} minutos`
      );
      console.log(
        `${type} dia ${addZeroLeft(lastRegister.getDate())} às ${addZeroLeft(
          lastRegister.getHours() - this.timeZone
        )}:${addZeroLeft(lastRegister.getMinutes())} minutos`
      );
    }
   
    if (exitTime.getDate() === enterTime.getDate()){
         const journeyTime = msToTime(Math.abs(exitTime - enterTime));
         speakOuts.push(
        `Sua última jornada durou ${journeyTime.hours} horas e ${journeyTime.minutes} minutos`
      );
    console.log(
      `[🤖] Sua última jornada durou ${journeyTime.hours} horas e ${addZeroLeft(
        journeyTime.minutes
      )} minutos`
    );
    }
      
    return speakOuts;
  }

  async createRegister() {
    const speakOuts = [];
    const { punches: lastRegisters } = await this.getRegisters();
    const today = new Date();
    const type =
      lastRegisters[0].source === 'automatic_break' ? 'exit' : 'entry';
    const payload = {
      punch: {
        is_manual: '',
        location_id: 19226,
        punch_type: type,
        device_datetime: today.toISOString(),
        time_zone: 'America/Sao_Paulo',
      },
      shift_compilation: {
        shift_id: formatDate(today) + '-1',
        date: formatDate(today),
        key: `${type}0`,
      },
    };
    console.log(payload);
    const res = await axios.post(
      'https://admin-api.oitchau.com.br/api/punches',
      payload,
      {
        headers: {
          'x-user-email': this.credentials.email,
          'x-user-token': this.token,
        },
      }
    );
    if (res.status === 201) {
      console.log('[🤖] Ponto registrado com sucesso');
      speakOuts.push(`Seu ponto do tipo ${type === 'exit' ? 'Saída' : 'Entrada'} foi batido com sucesso`)
    } else {
      console.log('[🤖] Falha ao bater o ponto');
      speakOuts.push(`Houve falha ao bater o seu ponto`)
    }
    return speakOuts
  }

  async getRegisters() {
    const today = new Date();
    const toDate = formatDate(today);
    today.setDate(today.getDate() - 3);
    const fromDate = formatDate(today);
    const res = await axios.get(
      `https://admin-api.oitchau.com.br/api/punches?page=1&perPage=20&employee_id=${this.employee_id}&from=${fromDate}&to=${toDate}`,
      {
        headers: {
          'x-user-email': this.credentials.email,
          'x-user-token': this.token,
        },
      }
    );
    return res.data;
  }
}

module.exports = OiTchauService;
