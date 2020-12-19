const random = {
  arrange: function (max, min) {
    return Math.random() * (max - min) + min;
  }, 
  event: function () {
    const eventNum =  parseInt(Math.random() * arguments.length);
    arguments[eventNum]();
  }
}

function smaller(a, b) {
	if(a >= b) {
		return b
	} else if (b > a) {
		return a
	}
}
