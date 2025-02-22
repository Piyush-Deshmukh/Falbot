const { SlashCommandBuilder } = require('discord.js');
const { specialArg, readFile, randint, changeDB, format } = require('../utils/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('horse')
		.setNameLocalization('pt-BR', 'cavalo')
		.setDescription('Bet in what horse is going to win')
		.setDescriptionLocalization('pt-BR', 'Aposte em qual cavalo é o mais rápido')
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName('horse')
				.setNameLocalization('pt-BR', 'cavalo')
				.setDescription('number of the horse you want to bet in, order is top to bottom')
				.setDescriptionLocalization('pt-BR', 'número do cavalo que você vai apostar')
				.setRequired(true)
				.addChoices(
					{ name: '1', value: '1' },
					{ name: '2', value: '2' },
					{ name: '3', value: '3' },
					{ name: '4', value: '4' },
					{ name: '5', value: '5' }
				)
		)
		.addStringOption((option) =>
			option
				.setName('falcoins')
				.setDescription(
					'the amount of falcoins you want to bet (supports "all"/"half" and things like 50.000, 20%, 10M, 25B)'
				)
				.setRequired(true)
		),
	execute: async ({ interaction, user, instance }) => {
		await interaction.deferReply().catch(() => {});
		try {
			const horse = interaction.options.getString('horse');
			const falcoins = interaction.options.getString('falcoins');
			try {
				var bet = await specialArg(falcoins, user.id, 'falcoins');
			} catch {
				await interaction.editReply({
					content: instance.getMessage(interaction, 'VALOR_INVALIDO', {
						VALUE: falcoins,
					}),
				});
				return;
			}
			if ((await readFile(user.id, 'falcoins')) >= bet) {
				await changeDB(user.id, 'falcoins', -bet);
				const horses = ['- - - - -', '- - - - -', '- - - - -', '- - - - -', '- - - - -'];
				const embed = instance
					.createEmbed(member.displayColor)
					.setDescription(
						instance.getMessage(interaction, 'CAVALO_DESCRIPTION', {
							BET: format(bet),
							HORSE: horse,
						})
					)
					.addFields({
						name: '\u200b',
						value: `**1.** :checkered_flag:  ${horses[0]} :horse_racing:\n\u200b\n**2.** :checkered_flag:  ${horses[1]} :horse_racing:\n\u200b\n**3.** :checkered_flag:  ${horses[2]} :horse_racing:\n\u200b\n**4.** :checkered_flag:  ${horses[3]} :horse_racing:\n\u200b\n**5.** :checkered_flag:  ${horses[4]}  :horse_racing:`,
					});

				await interaction.editReply({
					embeds: [embed],
				});

				for (let i = 0; i <= 21; i++) {
					const run = randint(0, 4);
					horses[run] = horses[run].slice(0, -2);

					embed.data.fields[0] = {
						name: '\u200b',
						value: `**1.** :checkered_flag:  ${horses[0]} :horse_racing:\n\u200b\n**2.** :checkered_flag:  ${horses[1]} :horse_racing:\n\u200b\n**3.** :checkered_flag:  ${horses[2]} :horse_racing:\n\u200b\n**4.** :checkered_flag:  ${horses[3]} :horse_racing:\n\u200b\n**5.** :checkered_flag:  ${horses[4]} :horse_racing:`,
					};
					await interaction.editReply({
						embeds: [embed],
					});

					if (horses[run] === '') {
						var winner = String(run + 1);
						break;
					}

					await new Promise((resolve) => setTimeout(resolve, 250));
				}

				if (horse == winner) {
					await changeDB(user.id, 'falcoins', bet * 5);
					embed.setColor(3066993).setDescription(
						instance.getMessage(interaction, 'CAVALO_DESCRIPTION_WON', {
							BET: format(bet),
							HORSE: horse,
							FALCOINS: format(bet * 5),
							SALDO: await readFile(user.id, 'falcoins', true),
						})
					);
				} else {
					embed.setColor(15158332).setDescription(
						instance.getMessage(interaction, 'CAVALO_DESCRIPTION_LOST', {
							BET: format(bet),
							HORSE: horse,
							SALDO: await readFile(user.id, 'falcoins', true),
						})
					);
				}

				await interaction.editReply({
					embeds: [embed],
				});
			} else {
				await interaction.editReply({
					content: instance.getMessage(interaction, 'FALCOINS_INSUFICIENTES'),
				});
			}
		} catch (error) {
			console.error(`horse: ${error}`);
			interaction.editReply({
				content: instance.getMessage(interaction, 'EXCEPTION'),
				embeds: [],
			});
		}
	},
};
