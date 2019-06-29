const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { cards, lists } = require('../store')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter

  .route('/list')

    .get((req, res) => {
        res
            .json(lists);
  })

  .post(bodyParser, (req, res) => {
    const {header, cardIds = []} = req.body;

    if (!header) {
        logger.error(`Header is required`);
        return res
            .status(400)
            .send('Invalid data');
    }

    if (cardIds.length > 0) {
        let valid = true;
        cardIds.forEach(cid => {
            const card = cards.find(c => c.id == cid);

            if (!card) {
                logger.error(`Card with id ${cid} not found in cards array.`);
                valid = false;
            }
        });

        if(!valid) {
            return res
                .status(404)
                .send('Invalid data');
        }
    }

    const id = uuid();

    const list = {
        id,
        header,
        cardIds
    }

    lists.push(list);

    logger.info(`list with id ${id} created`);

    res
        .status(201)
        .location(`http://localhost:8000/list/${id}`)
        .json({id});
  })

listRouter

  .route('/list/:id')

  .get((req, res) => {
    const {id} = req.params;
    const list = lists.find(li => li.id ==id)

    if (!list) {
        logger.error(`list with id ${id} not found`)
        return res
            .status(404)
            .send('List Not Found');
    }
    res.json(list);
  })

  .delete((req, res) => {
    const { id } = req.params;

    const cardIndex = cards.findIndex(c => c.id == id);
  
    if (cardIndex === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }
  
    lists.forEach(list => {
      const cardIds = list.cardIds.filter(cid => cid !== id);
      list.cardIds = cardIds;
    });
  
    cards.splice(cardIndex, 1);
  
    logger.info(`Card with id ${id} deleted.`);
  
    res
      .status(204)
      .end();
  })

module.exports = listRouter