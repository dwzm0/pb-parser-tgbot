import axios from 'axios'
import { config } from 'dotenv'
import express from 'express'
import {load} from 'cheerio'

config()

const app = express()

const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)

app.post('/new-message', async (req, res) => {
    const {message} = req.body
    const messageText = message?.text?.toLowerCase()?.trim()
    const chatId = message?.chat?.id

    console.log(message)

    if (!messageText || !chatId) {
      return res.sendStatus(400)
    }
    
    let responseText = "I am running"

    if (messageText === "films") {
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
    const actualFilms = films.filter(film => film.date.includes('Y-day') ||
                                             film.date.includes('Today'))    
    responseText = actualFilms
                                          
    try {
        await axios.post(TELEGRAM_URI, {
            chat_id: chatId,
            text: JSON.stringify(responseText)
        })
        res.send('Done')
    } catch (e) {
        console.log(e)
        res.send(e)
    }
}
  })
  

app.listen(process.env.DEVPORT, () => {
    console.log(`Server running on port ${process.env.DEVPORT}`);
  });
  