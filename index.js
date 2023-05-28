import axios from 'axios'
import { config } from 'dotenv'
import {load} from 'cheerio'
import {Bot} from "grammy"
import {schedule} from 'node-cron'

config()

const bot = new Bot(`${process.env.TELEGRAM_API_TOKEN}`)

const prepareFilms = async() => {
  const {data} = await axios.get('https://thepiratebay.party/top/200');
  const $ = load(data);
  const items = $('#main-content #searchResult tbody')
  const films = []

  items.find('tr').each((i, el) => {
      const film = {name: "", date: ""}
      film.name = $(el).children('td:eq(1)').text()
      film.date = $(el).children('td:eq(2)').text()
      films.push(film)
  })
  return films.filter(film => film.date.includes('Y-day') ||
                              film.date.includes('Today'))
}

schedule("0 9,21 * * *", async function(){
  const films = await prepareFilms()  
  films.forEach(film => bot.api.sendMessage(341296010, `${film.name + film.date}`))
})

bot.hears('films', async (ctx) => {
   const films = await prepareFilms()  
   films.forEach(film => ctx.reply(`${film.name + film.date}`))    
})

bot.start();

  