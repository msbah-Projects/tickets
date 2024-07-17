const client = require("../.")
const config = client.config;
const { getTable, createEmbed,IfAdmin} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'admin_panel',
	permissions: [],
	run: async (client, interaction) => {
        const db = await getTable("ticket");
		const ticket = await db.get(`tickets_${interaction.channel.id}`);
		const isAdmin = await IfAdmin(interaction);
		if (!isAdmin) return;

		const embed = await createEmbed("لوحة تحكم الأدارة", "الرجاء اختيار الزر المناسب لك",interaction)

		const claim = new ButtonBuilder()
 if(!ticket.claimed){
	 claim
	.setCustomId('claim')
	.setLabel('استلام التذكرة')
	.setEmoji("☑")
	.setStyle(ButtonStyle.Success);
 }else if(ticket.claimed == true && interaction.user.id == ticket.claimedBy){
	 claim 
	.setCustomId('unclaim')
	.setLabel('الغاء الأستلام')
	.setEmoji("❎")
	.setStyle(ButtonStyle.Danger);
 }else {
	claim 
	.setCustomId('clamid')
	.setLabel('التذكرة مستلمة بالفعل')
	.setEmoji("🔰")
	.setDisabled(true)
	.setStyle(ButtonStyle.Secondary);
 }

 
 const transcript = new ButtonBuilder()
 .setCustomId('transcript')
 .setLabel('أخذ نسخة')
 .setEmoji("📑")
 .setStyle(ButtonStyle.Secondary);

 const members_panel = new ButtonBuilder()
 .setCustomId('members_panel')
 .setLabel('الأعضاء داخل التذكرة')
 .setEmoji("👨🏾‍🤝‍👨🏻")
 .setStyle(ButtonStyle.Secondary);

 const rename = new ButtonBuilder()
 .setCustomId('rename')
 .setLabel('تغير اسم التذكرة')
 .setEmoji("🔖")
 .setStyle(ButtonStyle.Secondary);


 const send_msg = new ButtonBuilder()
 .setCustomId('send_msg')
 .setLabel('رساله لصاحب التذكرة')
 .setEmoji("📣")
 .setStyle(ButtonStyle.Secondary);
 const AdminTicketInfo = new ButtonBuilder()
 .setCustomId('AdminTicketInfo')
 .setLabel('معلومات التذكرة')
 .setEmoji("🧾")
 .setStyle(ButtonStyle.Secondary);

 const row = new ActionRowBuilder()
 .addComponents(claim, transcript,members_panel);
 const row2 = new ActionRowBuilder()
 .addComponents(rename, send_msg,AdminTicketInfo);

		
  interaction.reply({embeds: [embed],components: [row,row2],ephemeral:true})	
	}
};
