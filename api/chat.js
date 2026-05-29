export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({
      reply:"Method not allowed."
    });
  }

  const { message } = req.body;

  const text = (message || "").toLowerCase();

  const allowedKeywords = [
    "devil",
    "roulette",
    "bazooka",
    "peaky",
    "event",
    "update",
    "shop",
    "community",
    "vr"
  ];

  const related = allowedKeywords.some(
    keyword => text.includes(keyword)
  );

  if(!related){
    return res.status(200).json({
      reply:
      "I'm the Devil's Roulette Assistant and can only answer questions related to Devil's Roulette."
    });
  }

  return res.status(200).json({
    reply:
    "I found your question related to Devil's Roulette. Connect an AI provider next to generate detailed answers."
  });
}
