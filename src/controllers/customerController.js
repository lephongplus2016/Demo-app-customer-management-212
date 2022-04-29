const controller = {};
// innoDB: customer  
// myisam :customer_myisam   
var table_name = 'customer';

controller.list = (req, res) => {
  req.getConnection((err, conn) => {
    // get a timestamp before running the query
    var pre_query = new Date().getTime();
    conn.query(`SELECT * FROM ${table_name}`, (err, customers) => {
     if (err) {
      res.json(err);
     }
     // get a timestamp after running the query
    var post_query = new Date().getTime();
    // calculate the duration in seconds
    var duration = (post_query - pre_query) / 1000;
    console.log("Time load all records",duration);

     res.render('customers', {
        data: customers,
        time_to_query: duration
     });
    });
  });
};

controller.save = (req, res) => {
  const data = req.body;
  console.log(req.body)
  req.getConnection((err, connection) => {
    var pre_query = new Date().getTime();
    const query = connection.query(`INSERT INTO ${table_name} set ?`, data, (err, customer) => {
      // console.log(customer)
      var post_query = new Date().getTime();
      var insert_time = (post_query - pre_query) / 1000;
      console.log('Time to insert: ', insert_time);
      req.flash('success', `Add customer successfully - Time to excute: ${insert_time} second`,false);
      res.redirect('/');
    })
  })
};

controller.edit = (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    conn.query(`SELECT * FROM ${table_name} WHERE id = ?`, [id], (err, rows) => {
      res.render('customers_edit', {
        data: rows[0]
      })
    });
  });
};

controller.update = (req, res) => {
  const { id } = req.params;
  const newCustomer = req.body;
  req.getConnection((err, conn) => {
  var pre_query = new Date().getTime();
  conn.query(`UPDATE ${table_name} set ? where id = ?`, [newCustomer, id], (err, rows) => {
    var post_query = new Date().getTime();
    var update_time = (post_query - pre_query) / 1000;
    console.log('Time to update: ', update_time);
    req.flash('success', `Edit customer successfully - Time to excute: ${update_time} second`,false);
    res.redirect(`/update/${id}`);
  });
  });
};

controller.delete = (req, res) => {
  const { id } = req.params;
  req.getConnection((err, connection) => {
    connection.query(`DELETE FROM ${table_name} WHERE id = ?`, [id], (err, rows) => {
      req.flash('info', 'Delete customer successfully',false);
      res.redirect('/');
    });
  });
}



module.exports = controller;
